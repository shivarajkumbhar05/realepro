import { useEffect, useState } from 'react';
import { Bell, Check, Moon, Settings as SettingsIcon, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTINGS_KEY = 're_settings';

const DEFAULT_SETTINGS = {
  emailAlerts: true,
  purchaseUpdates: true,
  listingUpdates: true,
  darkMode: false,
};

function readSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings]);

  const updateSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    toast.success('Settings updated');
  };

  const options = [
    { key: 'emailAlerts', label: 'Email alerts', description: 'Receive important account notifications by email.', icon: Bell },
    { key: 'purchaseUpdates', label: 'Purchase updates', description: 'Get updates about offers and purchase requests.', icon: Check },
    { key: 'listingUpdates', label: 'Listing updates', description: 'Receive updates when listings change status.', icon: SlidersHorizontal },
    { key: 'darkMode', label: 'Dark mode', description: 'Use the darker interface appearance.', icon: Moon },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500">Manage notifications and display preferences.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
        {options.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <button
              type="button"
              aria-pressed={settings[key]}
              aria-label={`Toggle ${label}`}
              onClick={() => updateSetting(key)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings[key] ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
