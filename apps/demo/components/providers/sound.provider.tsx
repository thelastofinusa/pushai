"use client";

import React from "react";
import { createUISFX, type PackName, packNames, type UISFXPlayer } from "uisfx";

export type SoundPackName = (typeof packNames)[number];

const STORAGE_KEY_ENABLED = "uisfx_enabled";
const STORAGE_KEY_PACK = "uisfx_pack";
const STORAGE_KEY_VOLUME = "uisfx_volume";

type SoundFxContextValue = {
  enabled: boolean;
  pack: PackName;
  volume: number;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
  setPack: (pack: SoundPackName) => void;
  setVolume: (volume: number) => void;
  play: (
    cue: Parameters<UISFXPlayer["play"]>[0],
  ) => ReturnType<UISFXPlayer["play"]> | undefined;
};

const SoundFxContext = React.createContext<SoundFxContextValue | null>(null);

export function SoundFxProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = React.useState(false);
  const [pack, setPackState] = React.useState<SoundPackName>(packNames[0]);
  const [volume, setVolumeState] = React.useState(0.7);

  const soundFxRef = React.useRef<UISFXPlayer | null>(null);
  const disableTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  if (!soundFxRef.current && typeof window !== "undefined") {
    soundFxRef.current = createUISFX({
      pack: "zen",
      volume: 1,
      enabled: false,
    });
  }

  // Hydrate state from localStorage after mount
  React.useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (storedEnabled !== null) {
        const parsedEnabled: boolean = JSON.parse(storedEnabled);
        setEnabledState(parsedEnabled);
        soundFxRef.current?.setEnabled(parsedEnabled);
      }

      const storedPack = localStorage.getItem(
        STORAGE_KEY_PACK,
      ) as SoundPackName;
      if (storedPack && packNames.includes(storedPack)) {
        setPackState(storedPack);
        soundFxRef.current?.setPack(storedPack);
      }

      const storedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (storedVolume !== null) {
        const parsedVolume = Math.min(1, Math.max(0, JSON.parse(storedVolume)));
        setVolumeState(parsedVolume);
        soundFxRef.current?.setVolume(parsedVolume);
      }
    } catch (error) {
      console.error(
        "Failed to read SoundFX settings from localStorage:",
        error,
      );
    }
  }, []);

  const setEnabled = React.useCallback((value: boolean) => {
    if (disableTimeoutRef.current) {
      clearTimeout(disableTimeoutRef.current);
      disableTimeoutRef.current = null;
    }

    if (value) {
      soundFxRef.current?.setEnabled(true);
      setEnabledState(true);
    } else {
      soundFxRef.current?.play("remove-from-cart");
      setEnabledState(false);

      disableTimeoutRef.current = setTimeout(() => {
        soundFxRef.current?.setEnabled(false);
      }, 350);
    }

    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save enabled state to localStorage:", error);
    }
  }, []);

  const setPack = React.useCallback((nextPack: SoundPackName) => {
    setPackState(nextPack);
    soundFxRef.current?.setPack(nextPack);
    try {
      localStorage.setItem(STORAGE_KEY_PACK, nextPack);
    } catch (error) {
      console.error("Failed to save pack to localStorage:", error);
    }
  }, []);

  const setVolume = React.useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);
    soundFxRef.current?.setVolume(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, JSON.stringify(clamped));
    } catch (error) {
      console.error("Failed to save volume to localStorage:", error);
    }
  }, []);

  const toggle = React.useCallback(() => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);

    if (nextEnabled) {
      soundFxRef.current?.play("add-to-cart");
    }
  }, [enabled, setEnabled]);

  const play = React.useCallback((cue: Parameters<UISFXPlayer["play"]>[0]) => {
    return soundFxRef.current?.play(cue);
  }, []);

  const value = React.useMemo(
    () => ({
      enabled,
      pack,
      volume,
      toggle,
      setEnabled,
      setPack,
      setVolume,
      play,
    }),
    [enabled, pack, volume, toggle, setEnabled, setPack, setVolume, play],
  );

  return (
    <SoundFxContext.Provider value={value}>{children}</SoundFxContext.Provider>
  );
}

export function useSoundFx() {
  const context = React.useContext(SoundFxContext);

  if (!context) {
    throw new Error("useSoundFx must be used within a SoundFxProvider");
  }

  return context;
}
