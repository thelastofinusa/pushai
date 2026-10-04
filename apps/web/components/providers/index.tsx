"use client";

import type React from "react";
import { Footer } from "../shared/footer";
import { Navbar } from "../shared/navbar";
import { StatsProvider } from "./stats.provider";
import { ThemeProvider } from "./theme.provider";

export default function GlobalProvider(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StatsProvider>
        <Navbar />
        {props.children}
        <Footer />
      </StatsProvider>
    </ThemeProvider>
  );
}
