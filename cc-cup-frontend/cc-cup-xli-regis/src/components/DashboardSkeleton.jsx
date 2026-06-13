// src/components/DashboardSkeleton.jsx
// Full-page skeleton that mirrors DashboardPage layout exactly.
// Shown while the dashboard API request is in-flight.
import React from 'react';
import Skeleton from './ui/Skeleton';

/* ─── Header (mirrors NavigationHeader) ─────────────────────────────────── */
function HeaderSkeleton() {
  return (
    <header className="hidden md:flex items-center justify-between px-12 py-5 border-b-4 border-black sticky top-0 bg-white z-40">
      <Skeleton className="h-6 w-28" />
      <nav className="flex items-center space-x-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </nav>
    </header>
  );
}

/* ─── Status Banner (mirrors StatusBanner) ──────────────────────────────── */
function StatusBannerSkeleton() {
  return (
    <div className="border-4 border-black p-6 md:p-8 rounded-xl bg-white space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-8 w-3/4 md:w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex-shrink-0">
          <Skeleton className="h-14 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ─── Team Summary Grid (mirrors TeamSummaryGrid – 3 cards) ─────────────── */
function TeamSummaryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="border-2 border-black p-4 rounded-lg bg-gray-50 flex flex-col justify-between space-y-2"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ))}
    </div>
  );
}

/* ─── Team Info Workspace (mirrors TeamInfoWorkspace) ───────────────────── */
function TeamInfoWorkspaceSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center border-b-2 border-black pb-2">
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="border-2 border-black rounded-xl p-5 bg-white space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Skeleton className="h-3 w-40" />
        {/* Two placeholder input rows */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-28 mb-1" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-36 mb-1" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </section>
  );
}

/* ─── Single File Slot (mirrors FileSlot) ──────────────────────────────── */
function FileSlotSkeleton({ label }) {
  return (
    <div className="border-2 border-black rounded-xl p-4 bg-gray-50 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/* ─── Team Files Workspace (mirrors TeamFilesWorkspace – 5 file slots) ──── */
function TeamFilesWorkspaceSkeleton() {
  const FILE_LABELS = [
    '1. Bukti Pembayaran',
    '2. Kartu Pelajar Kapten',
    '3. Selfie Dengan Kartu Pelajar',
    '4. Surat Pernyataan Tim',
    '5. Surat Izin Sekolah',
  ];
  return (
    <section className="lg:col-span-5 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-5 w-24 rounded" />
      </div>
      <div className="space-y-4">
        {FILE_LABELS.map((label) => (
          <FileSlotSkeleton key={label} label={label} />
        ))}
      </div>
    </section>
  );
}

/* ─── Roster Member Card (mirrors RosterMemberCard) ─────────────────────── */
function RosterMemberCardSkeleton() {
  return (
    <div className="border-2 border-black p-4 rounded-xl bg-white flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-14 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Roster Workspace (mirrors RosterWorkspace) ────────────────────────── */
function RosterWorkspaceSkeleton() {
  return (
    <section className="lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-5 w-32 rounded" />
      </div>
      {/* Add member button placeholder */}
      <Skeleton className="h-14 w-full rounded-xl border-2 border-dashed border-gray-200" />
      {/* 3 placeholder member cards */}
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <RosterMemberCardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-3 w-32 mt-2" />
    </section>
  );
}

/* ─── Mobile Toolbar (mirrors MobileToolbar) ───────────────────────────── */
function MobileToolbarSkeleton() {
  return (
    <nav className="md:hidden sticky bottom-0 bg-white border-t-2 border-black w-full py-3 px-6 flex justify-around items-center z-40 shadow-md">
      <div className="flex flex-col items-center space-y-1">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-2 w-10" />
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-2 w-10" />
      </div>
    </nav>
  );
}

/* ─── Full Dashboard Skeleton ──────────────────────────────────────────── */
export default function DashboardSkeleton() {
  return (
    <div className="bg-white text-black font-inter min-h-screen flex flex-col justify-between antialiased">
      <HeaderSkeleton />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-6 md:py-10 space-y-8">
        <StatusBannerSkeleton />
        <TeamSummaryGridSkeleton />
        <TeamInfoWorkspaceSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <TeamFilesWorkspaceSkeleton />
          <RosterWorkspaceSkeleton />
        </div>
      </main>

      <MobileToolbarSkeleton />
    </div>
  );
}
