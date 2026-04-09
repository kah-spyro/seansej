"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const HERO_IMGS = ["/images/hero-1.jpg", "/images/hero-2.jpg"];

export default function Home() {
  const [heroBg, setHeroBg] = useState(HERO_IMGS[0]);
  useEffect(() => {
    setHeroBg(HERO_IMGS[Math.floor(Math.random() * HERO_IMGS.length)]);
  }, []);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(19,19,20,0.4) 0%, rgba(19,19,20,0.9) 80%, rgba(19,19,20,1) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/30 border border-outline-variant/15 glass-card">
            <span
              className="material-symbols-outlined text-tertiary text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="text-on-secondary-container text-xs uppercase tracking-widest font-semibold">
              AI-Powered Curation
            </span>
          </div>

          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-extrabold text-on-surface tracking-tight mb-8 text-glow">
            Find Your Perfect{" "}
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent italic">
              Movie Tonight
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-on-surface-variant leading-relaxed mb-12">
            Take our 2-minute quiz and get a personalized movie profile tailored
            to your mood. No more endless scrolling, just cinematic masterpieces.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/quiz"
              className="relative px-10 py-5 bg-gradient-to-br from-primary to-primary-container rounded-xl text-on-primary font-headline font-bold text-lg hover:scale-105 transition-all duration-300 active:scale-95"
              style={{ boxShadow: "0 10px 40px rgba(93,54,229,0.3)" }}
            >
              Start Quiz
            </Link>
            <Link
              href="/quiz"
              className="px-10 py-5 bg-surface-variant/20 border border-outline-variant/15 rounded-xl text-on-surface font-headline font-bold text-lg glass-card hover:bg-surface-variant/40 transition-all"
            >
              Browse Matches
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* The Mood Matcher */}
          <div className="md:col-span-8 bg-surface-container rounded-2xl overflow-hidden relative group min-h-[280px]">
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/bento-mood.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-12 h-full flex flex-col justify-end bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent">
              <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4">
                Core Engine
              </span>
              <h3 className="font-headline text-4xl font-bold mb-4">
                The Mood Matcher
              </h3>
              <p className="text-on-surface-variant max-w-md">
                Our algorithm analyzes emotional data points to find films that
                resonate with your current state of mind.
              </p>
            </div>
          </div>

          {/* Match Gauge */}
          <div className="md:col-span-4 bg-surface-container-high rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-outline-variant/10">
            <div className="relative w-40 h-40 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  className="text-surface-container-highest"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-primary"
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="currentColor"
                  strokeDasharray="440"
                  strokeDashoffset="44"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-headline text-4xl font-black text-on-surface">
                  94%
                </span>
              </div>
            </div>
            <h4 className="font-headline text-xl font-bold mb-2">
              High Precision
            </h4>
            <p className="text-sm text-on-surface-variant">
              Users report a 94% satisfaction rate with tailored recommendations.
            </p>
          </div>

          {/* Beyond the Algorithm */}
          <div className="md:col-span-12 bg-surface-container rounded-2xl overflow-hidden relative group min-h-[240px]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/40 to-transparent z-10" />
            </div>
            <div className="relative z-20 p-12 flex flex-col justify-center max-w-lg">
              <h3 className="font-headline text-4xl font-bold mb-4">
                Beyond the Algorithm
              </h3>
              <p className="text-on-surface-variant">
                We don&#39;t just use data. Our curation system tags every movie
                with visual and narrative nuances that algorithms miss.
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-tighter">
                  Mood Analysis
                </span>
                <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-tighter">
                  Pacing Match
                </span>
                <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-tighter">
                  Era Preference
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cinematic Quote ── */}
      <section className="py-32 text-center bg-surface-container-lowest">
        <div className="max-w-4xl mx-auto px-6">
          <span
            className="material-symbols-outlined text-primary text-6xl opacity-30 block mb-8"
            style={{ fontSize: "4rem" }}
          >
            format_quote
          </span>
          <blockquote className="font-headline text-3xl md:text-5xl italic font-light text-on-surface leading-tight mb-10">
            &ldquo;Movies are like a machine that generates empathy. Movie Match
            is the mechanic that ensures you get the right fuel.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary">
              <span className="material-symbols-outlined text-on-primary-container text-xl">
                person
              </span>
            </div>
            <div className="text-left">
              <p className="font-bold text-on-surface">The Curator</p>
              <p className="text-sm text-on-surface-variant">
                Level 12 Cinephile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10 px-6">
          <h2 className="font-headline text-4xl md:text-5xl font-black mb-8">
            Ready to meet your match?
          </h2>
          <p className="text-on-surface-variant text-lg mb-12">
            Stop scrolling. Start watching exactly what you need tonight.
          </p>
          <Link
            href="/quiz"
            className="inline-block px-12 py-6 bg-gradient-to-r from-primary to-primary-container rounded-xl text-on-primary font-headline font-black text-xl hover:scale-105 transition-all active:scale-95"
            style={{ boxShadow: "0 20px 50px rgba(93,54,229,0.4)" }}
          >
            START THE 2-MINUTE QUIZ
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-8 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-headline font-black italic text-indigo-400">
            Seansej
          </div>
          <div className="flex gap-8 text-on-surface-variant text-sm font-medium flex-wrap justify-center">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Contact
            </a>
          </div>
          <div className="flex gap-4">
            {["star", "share"].map((icon) => (
              <div
                key={icon}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  {icon}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center mt-12 text-[10px] uppercase tracking-[0.2em] text-outline">
          © 2024 SEANSEJ. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  );
}
