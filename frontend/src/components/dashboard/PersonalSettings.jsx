'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useClerkStatus } from '../auth/ClerkSafeProvider';

const defaultPreferences = { air_quality: false, weather: false };
const inputClass = 'w-full rounded border border-white/20 bg-[#0e110f] px-3 py-2';
const buttonClass = 'rounded border border-white/30 px-3 py-2 text-sm disabled:opacity-50';

function AccountSettings({ getToken, userId }) {
  const client = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { accessToken: getToken }
  ), [getToken]);
  const [locations, setLocations] = useState([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setReady(false);
      setError('');
      try {
        const [places, alerts] = await Promise.all([
          client.from('ecosphere_saved_locations').select('id,name,latitude,longitude')
            .order('created_at').abortSignal(controller.signal),
          client.from('ecosphere_alert_preferences').select('air_quality,weather')
            .abortSignal(controller.signal).maybeSingle(),
        ]);
        if (controller.signal.aborted) return;
        if (places.error || alerts.error) throw places.error || alerts.error;
        setLocations(places.data);
        setPreferences(alerts.data ?? defaultPreferences);
        setReady(true);
      } catch (failure) {
        if (controller.signal.aborted) return;
        const code = /^[A-Z0-9_]{5,12}$/.test(failure?.code ?? '') ? failure.code : null;
        if (code === '42501' || code === 'PGRST301' || code === 'PGRST303') {
          setError(`Your sign-in could not be verified for personal settings. Sign in again and retry. (${code})`);
        } else {
          setError(`Could not load your personal settings. Please retry.${code ? ` (${code})` : ''}`);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [client, attempt]);

  async function save(action, successMessage) {
    setSaving(true);
    setError('');
    setStatus('');
    try {
      await action();
      setStatus(successMessage);
    } catch {
      setError('Could not save your change. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function addLocation(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    if (!name) {
      setError('Enter a location name.');
      return;
    }
    save(async () => {
      const { data: location, error } = await client.from('ecosphere_saved_locations')
        .insert({ name, latitude: Number(data.get('latitude')), longitude: Number(data.get('longitude')) })
        .select('id,name,latitude,longitude').single();
      if (error) throw error;
      setLocations(previous => [...previous, location]);
      form.reset();
    }, 'Location saved.');
  }

  function removeLocation(id) {
    save(async () => {
      const { error } = await client.from('ecosphere_saved_locations').delete().eq('id', id);
      if (error) throw error;
      setLocations(previous => previous.filter(location => location.id !== id));
    }, 'Location removed.');
  }

  function savePreferences(event) {
    event.preventDefault();
    save(async () => {
      const { error } = await client.from('ecosphere_alert_preferences')
        .upsert({ user_id: userId, ...preferences });
      if (error) throw error;
    }, 'Alert preferences saved.');
  }

  return (
    <section className="mx-auto max-w-6xl space-y-4 px-6 py-8" aria-labelledby="personal-settings-title">
      <h2 id="personal-settings-title" className="font-serif text-2xl">Your personal settings</h2>
      {loading && <p role="status">Loading your settings…</p>}
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      {!loading && !ready && <button className={buttonClass} onClick={() => setAttempt(value => value + 1)}>Retry</button>}
      {ready && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-white/15 p-4">
            <h3 className="text-lg">Saved locations</h3>
            {locations.length === 0 && <p>No saved locations yet.</p>}
            <ul className="space-y-2">
              {locations.map(location => (
                <li key={location.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>{location.name} ({location.latitude}, {location.longitude})</span>
                  <button type="button" className={buttonClass} disabled={saving}
                    aria-label={`Remove ${location.name}`} onClick={() => removeLocation(location.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <form onSubmit={addLocation}>
              <fieldset disabled={saving} className="space-y-2">
                <label className="block">Location name<input className={inputClass} name="name" required maxLength={100} /></label>
                <label className="block">Latitude<input className={inputClass} name="latitude" type="number" step="any" min={-90} max={90} required /></label>
                <label className="block">Longitude<input className={inputClass} name="longitude" type="number" step="any" min={-180} max={180} required /></label>
                <button className={buttonClass}>Save location</button>
              </fieldset>
            </form>
          </div>
          <form onSubmit={savePreferences} className="space-y-4 rounded-xl border border-white/15 p-4">
            <h3 className="text-lg">Alert preferences</h3>
            <p className="text-sm text-[#c2bcb0]">Save the alert types you want. Alert delivery will be added separately.</p>
            <fieldset disabled={saving} className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={preferences.air_quality}
                  onChange={event => setPreferences({ ...preferences, air_quality: event.target.checked })} />
                Air quality alerts
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={preferences.weather}
                  onChange={event => setPreferences({ ...preferences, weather: event.target.checked })} />
                Weather alerts
              </label>
              <button className={buttonClass}>Save alert preferences</button>
            </fieldset>
          </form>
        </div>
      )}
    </section>
  );
}

function SignedInSettings() {
  const { getToken, userId } = useAuth();
  if (!userId) return null;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <p className="mx-auto max-w-6xl px-6 py-8">Personal settings are currently unavailable.</p>;
  }
  return <AccountSettings key={userId} userId={userId} getToken={getToken} />;
}

export default function PersonalSettings() {
  const { isConfigured } = useClerkStatus();
  return isConfigured ? <SignedInSettings /> : null;
}
