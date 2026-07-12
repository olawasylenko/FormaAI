"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Moon,
  Save,
  Sun,
  UserRound,
} from "lucide-react";

import { auth } from "@/lib/firebase";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function SettingsPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setDisplayName(currentUser?.displayName ?? "");

      if (currentUser) {
        const savedImage = localStorage.getItem(
          `formaai-profile-image-${currentUser.uid}`
        );
        setProfileImage(savedImage);
      }

      const savedTheme = localStorage.getItem("formaai-theme");
      const shouldUseDarkMode = savedTheme === "dark";

      setDarkMode(shouldUseDarkMode);
      document.documentElement.classList.toggle("dark", shouldUseDarkMode);

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setProfileError("");
    setProfileMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Wybierz prawidłowy plik graficzny.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setProfileError("Zdjęcie profilowe może mieć maksymalnie 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      setProfileImage(reader.result);

      if (user) {
        localStorage.setItem(
          `formaai-profile-image-${user.uid}`,
          reader.result
        );
      }

      window.dispatchEvent(new Event("formaai-profile-updated"));
      setProfileMessage("Zdjęcie profilowe zostało zmienione.");
    };

    reader.readAsDataURL(file);
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();

    setProfileError("");
    setProfileMessage("");

    const trimmedName = displayName.trim();

    if (!user) {
      setProfileError("Nie znaleziono zalogowanego użytkownika.");
      return;
    }

    if (trimmedName.length < 2) {
      setProfileError("Nazwa użytkownika musi mieć minimum 2 znaki.");
      return;
    }

    setSavingProfile(true);

    try {
      await updateProfile(user, {
        displayName: trimmedName,
      });

      await user.reload();

      setUser(auth.currentUser);
      setProfileMessage("Nazwa użytkownika została zapisana.");

      window.dispatchEvent(new Event("formaai-profile-updated"));
    } catch {
      setProfileError("Nie udało się zapisać nazwy użytkownika.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleThemeChange(value: boolean) {
    setDarkMode(value);
    document.documentElement.classList.toggle("dark", value);
    localStorage.setItem("formaai-theme", value ? "dark" : "light");
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (!user || !user.email) {
      setPasswordError("Nie znaleziono danych zalogowanego użytkownika.");
      return;
    }

    if (!currentPassword) {
      setPasswordError("Wpisz obecne hasło.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Nowe hasło musi mieć minimum 6 znaków.");
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordError("Nowe hasła nie są takie same.");
      return;
    }

    setSavingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");

      setPasswordMessage("Hasło zostało zmienione.");
    } catch {
      setPasswordError(
        "Nie udało się zmienić hasła. Sprawdź, czy obecne hasło jest prawidłowe."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted">Wczytywanie ustawień...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ustawienia</h1>
        <p className="mt-2 text-muted">
          Zarządzaj swoim profilem, wyglądem aplikacji i hasłem.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm lg:p-8 dark:bg-[#24271f]">
        <div className="flex items-center gap-3">
          <UserRound className="text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Profil użytkownika
            </h2>
            <p className="mt-1 text-sm text-muted">
              Zmień nazwę i zdjęcie widoczne w aplikacji.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-primary-light bg-background">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Zdjęcie profilowe"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={54} className="text-muted" />
              )}
            </div>

            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-primary-light">
              <Camera size={17} />
              Zmień zdjęcie
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="mt-3 text-xs text-muted">Maksymalnie 2 MB.</p>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Nazwa użytkownika
            </label>

            <input
              type="text"
              required
              maxLength={40}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:border-primary dark:bg-[#1d2019]"
            />

            <label className="mb-2 mt-5 block text-sm font-medium text-foreground">
              Adres e-mail
            </label>

            <input
              type="email"
              disabled
              value={user?.email ?? ""}
              className="w-full cursor-not-allowed rounded-xl border border-border bg-background px-4 py-3 text-muted"
            />

            {profileError && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </p>
            )}

            {profileMessage && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
                <CheckCircle2 size={17} />
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-accent disabled:opacity-60"
            >
              <Save size={18} />
              {savingProfile ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm lg:p-8 dark:bg-[#24271f]">
        <div className="flex items-center gap-3">
          {darkMode ? (
            <Moon className="text-primary" />
          ) : (
            <Sun className="text-primary" />
          )}

          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Wygląd aplikacji
            </h2>
            <p className="mt-1 text-sm text-muted">
              Wybierz jasny albo ciemny tryb.
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between rounded-2xl border border-border bg-background p-5">
          <div>
            <p className="font-semibold text-foreground">Tryb ciemny</p>
            <p className="mt-1 text-sm text-muted">
              Zmień kolorystykę całej aplikacji.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleThemeChange(!darkMode)}
            aria-pressed={darkMode}
            className={`relative h-8 w-14 rounded-full transition ${
              darkMode ? "bg-primary" : "bg-[#c9c9c0]"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                darkMode ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm lg:p-8 dark:bg-[#24271f]">
        <div className="flex items-center gap-3">
          <KeyRound className="text-primary" />

          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Zmiana hasła
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dla bezpieczeństwa wpisz najpierw obecne hasło.
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="mt-8 max-w-xl space-y-5"
        >
          <PasswordField
            label="Obecne hasło"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((value) => !value)}
          />

          <PasswordField
            label="Nowe hasło"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((value) => !value)}
          />

          <PasswordField
            label="Powtórz nowe hasło"
            value={repeatPassword}
            onChange={setRepeatPassword}
            visible={showRepeatPassword}
            onToggle={() => setShowRepeatPassword((value) => !value)}
          />

          {passwordError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 size={17} />
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-accent disabled:opacity-60"
          >
            <KeyRound size={18} />
            {savingPassword ? "Zmienianie hasła..." : "Zmień hasło"}
          </button>
        </form>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-border bg-white py-3 pl-4 pr-12 text-foreground outline-none focus:border-primary dark:bg-[#1d2019]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:bg-background"
          aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}
