// src/pages/creator/CreatorRevenueAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components2/ui/button";
import { toast } from "@/components2/ui/use-toast";

import { getMe, getUserCourses } from "@/services/auth";
import {
  getCreatorRevenueSummary,
  getCreatorCoursesRevenueTable,
} from "@/services/revenue";

import CreatorCustomizeModal from "../CreatorCustomizeModal";

import {
  Loader2,
  ArrowLeft,
  BarChart2,
  DollarSign,
  Receipt,
  ShieldCheck,
  Users,
  CalendarClock,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  BookOpen,
  ExternalLink,
} from "lucide-react";

/**
 * This page is intentionally "full-page" (no sidebar),
 * because sidebar actions depend on dashboard-only state/modals.
 * We provide equivalents here:
 * - Back to dashboard
 * - View creator page
 * - Edit Page Style (opens CreatorCustomizeModal)
 * - Quick create course (navigates to dashboard + opens modal via query param)
 */

const centsToMoney = (cents, currency = "usd") => {
  const n = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency || "usd").toUpperCase(),
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency?.toUpperCase?.() || "USD"} ${n.toFixed(2)}`;
  }
};

const isoDate = (d) => {
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const lastNDaysRange = (days = 30) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return { start: isoDate(start), end: isoDate(end) };
};

const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.courses)) return data.courses;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

export default function CreatorRevenueAnalytics() {
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [querying, setQuerying] = useState(false);

  const [range, setRange] = useState(() => lastNDaysRange(30));
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);

  const [needsCustomization, setNeedsCustomization] = useState(false);

  const currency = useMemo(() => {
    return (
      summary?.currency ||
      summary?.totals?.currency ||
      rows?.[0]?.currency ||
      "usd"
    );
  }, [summary, rows]);

  const totals = useMemo(() => {
    const t = summary?.totals || summary?.payments || summary || {};
    const creatorEarned = Number(t.creator_earned_cents || 0);
    const refunds = Number(t.refunds_cents || t.refund_cents || 0);

    return {
      orders_count: Number(t.orders_count || t.orders || 0),
      gross_cents: Number(t.gross_cents || 0),
      platform_fee_cents: Number(t.platform_fee_cents || 0),
      creator_earned_cents: creatorEarned,
      refunds_cents: refunds,
      // "net" = creator earned - refunds (if your API provides refunds)
      net_cents: Number(t.net_cents || (creatorEarned - refunds)),
    };
  }, [summary]);

  const enrollments = useMemo(() => {
    const e = summary?.enrollments || {};
    return {
      total: Number(e.total || e.total_count || 0),
      paid: Number(e.paid || e.paid_count || 0),
      free: Number(e.free || e.free_count || 0),
    };
  }, [summary]);

  const courseStats = useMemo(() => {
    const c = summary?.courses || {};
    return {
      total: Number(c.total || courses.length || 0),
      paid: Number(c.paid || 0),
      free: Number(c.free || 0),
      published: Number(c.published || 0),
      drafts: Number(c.drafts || 0),
    };
  }, [summary, courses]);

  const load = async () => {
    setQuerying(true);
    try {
      const [meRes, coursesRes, sRes, tRes] = await Promise.all([
        getMe(),
        getUserCourses(),
        getCreatorRevenueSummary(range),
        getCreatorCoursesRevenueTable(range),
      ]);

      const meUser = meRes?.user || meRes;
      setCreator(meUser);

      const courseList = toArray(coursesRes);
      setCourses(courseList);

      setSummary(sRes || null);
      setRows(toArray(tRes?.items ? tRes : tRes) || []);
    } catch (err) {
      console.error("[CreatorRevenueAnalytics] load error:", err);
      toast(
         "Failed to load analytics",
         { description:
          err?.response?.data?.error ||
          err?.message ||
          "Could not load revenue analytics.",
        variant: "destructive",
      });
    } finally {
      setQuerying(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyRange = async () => {
    await load();
  };

  const bentoCards = useMemo(() => {
    return [
      {
        title: "Gross Revenue",
        value: centsToMoney(totals.gross_cents, currency),
        sub: `${totals.orders_count} paid orders`,
        icon: <DollarSign className="h-5 w-5 text-[#EA7125]" />,
        tint: "border-[#EA7125]/20 bg-white/80",
      },
      {
        title: "Creator Earned",
        value: centsToMoney(totals.creator_earned_cents, currency),
        sub: "Your earnings (pre payout)",
        icon: <ShieldCheck className="h-5 w-5 text-[#66A569]" />,
        tint: "border-[#66A569]/20 bg-white/80",
      },
      {
        title: "Platform Fee",
        value: centsToMoney(totals.platform_fee_cents, currency),
        sub: "Ops + payment rails",
        icon: <Receipt className="h-5 w-5 text-[#2C365E]" />,
        tint: "border-[#2C365E]/20 bg-white/80",
      },
      {
        title: "Enrollments",
        value: `${enrollments.total}`,
        sub: `${enrollments.paid} paid • ${enrollments.free} free`,
        icon: <Users className="h-5 w-5 text-[#7C3AED]" />,
        tint: "border-[#7C3AED]/20 bg-white/80",
      },
    ];
  }, [totals, currency, enrollments]);

  const sortedRows = useMemo(() => {
    const list = [...(rows || [])];
    list.sort(
      (a, b) =>
        Number(b?.creator_earned_cents || 0) -
        Number(a?.creator_earned_cents || 0)
    );
    return list;
  }, [rows]);

  const courseMeta = useMemo(() => {
    const m = new Map();
    courses.forEach((c) => m.set(String(c.id), c));
    return m;
  }, [courses]);
  
  const mergedRows = useMemo(() => {
    return (rows || []).map((r) => {
      const id = String(r.course_id || r.id || "");
      const c = courseMeta.get(id);
      return {
        ...r,
        course_id: r.course_id ?? c?.id,
        title: r.title || c?.title,
        student_count:
          r.student_count ?? c?.student_count ?? c?.enrollment_count ?? 0,
        module_count: r.module_count ?? c?.module_count ?? 0,
        is_paid: r.is_paid ?? c?.is_paid ?? false,
        price_cents: r.price_cents ?? c?.price_cents ?? 0,
        currency: r.currency ?? c?.currency ?? "usd",
      };
    });
  }, [rows, courseMeta]);
  

  // Optional: find course by id from rows so we can link to Stripe (if you later add stripe_link)
  const courseById = useMemo(() => {
    const map = new Map();
    (courses || []).forEach((c) => map.set(String(c.id), c));
    return map;
  }, [courses]);

  const openCourseManage = (courseId) => {
    // Navigate to dashboard and let it open the manage modal (you implement reading this query param there)
    // Example: in CreatorDashboard, on mount if searchParams.get("openCourse") exists -> setActiveModal(`manage-${id}`)
    navigate(`/creator/dashboard?openCourse=${courseId}`);
  };

  const openNewCourse = () => {
    navigate(`/creator/dashboard?open=new-course`);
  };

  const openCustomize = () => {
    setNeedsCustomization(true);
  };

  const handleCustomizationComplete = () => {
    setNeedsCustomization(false);
    load();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2C365E] mx-auto mb-2" />
          <p className="text-[#222222] text-sm">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222]">
      {/* Sticky top bar (mobile-first) */}
      <div className="sticky top-0 z-30 bg-[#FAF8F4]/80 backdrop-blur-md border-b border-[#2C365E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-[#2C365E]/10 shrink-0">
              <BarChart2 className="h-5 w-5 text-[#2C365E]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base sm:text-lg truncate">
                Revenue Analytics
              </p>
              <p className="text-xs text-[#2C365E]/70 truncate">
                {creator?.full_name ? `For ${creator.full_name}` : "Live performance"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="bg-white/80 border-[#2C365E]/15 hover:bg-[#2C365E]/5"
              onClick={() => navigate("/creator/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        {/* Header actions (responsive) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#EA7125]/10">
                <Sparkles className="h-5 w-5 text-[#EA7125]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Earnings & Enrollment Insights
              </h1>
            </div>
            <p className="text-sm text-[#2C365E] mt-1">
              See gross revenue, your earnings, platform fees, and per-course performance.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={openCustomize}
              className="bg-white/80 backdrop-blur-md border-[#EA7125]/20 hover:bg-[#EA7125]/10 hover:border-[#EA7125]/30"
            >
              Edit Page Style
            </Button>

            <Button
              variant="outline"
              onClick={openNewCourse}
              className="bg-white/80 backdrop-blur-md border-[#2C365E]/15 hover:bg-[#2C365E]/5"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Course
            </Button>

            <Button className="bg-[#EA7125] hover:bg-[#EA7125]/90" asChild>
              <a
                href={`/${creator?.slug || ""}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View My Page <ArrowUpRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* Range controls */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2C365E]">
              <CalendarClock className="h-4 w-4 text-[#EA7125]" />
              Date Range
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 w-full lg:w-auto">
              <input
                type="date"
                value={range.start}
                onChange={(e) =>
                  setRange((p) => ({ ...p, start: e.target.value }))
                }
                className="px-3 py-2 rounded-xl border border-[#2C365E]/15 bg-white text-sm w-full"
              />
              <input
                type="date"
                value={range.end}
                onChange={(e) =>
                  setRange((p) => ({ ...p, end: e.target.value }))
                }
                className="px-3 py-2 rounded-xl border border-[#2C365E]/15 bg-white text-sm w-full"
              />

              <Button
                onClick={onApplyRange}
                disabled={querying}
                className="bg-[#2C365E] hover:bg-[#2C365E]/90 w-full sm:w-auto"
              >
                {querying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading
                  </>
                ) : (
                  "Apply"
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  const next = lastNDaysRange(30);
                  setRange(next);
                  setTimeout(() => onApplyRange(), 0);
                }}
              >
                Last 30d
              </Button>
            </div>

            <div className="text-xs text-[#2C365E]/70 lg:ml-auto">
              Currency:{" "}
              <span className="font-semibold">
                {String(currency).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bentoCards.map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4 }}
              className={`${card.tint} p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-[#FAF8F4]">{card.icon}</div>
              </div>
              <p className="text-sm font-semibold text-[#2C365E]">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-[#222222] mt-1">
                {card.value}
              </p>
              <p className="text-xs text-[#2C365E]/70 mt-1">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Secondary bento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#2C365E]">Courses</p>
            <p className="text-2xl font-bold mt-1">{courseStats.total}</p>
            <p className="text-xs text-[#2C365E]/70 mt-1">
              {courseStats.paid} paid • {courseStats.free} free
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#2C365E]">Status</p>
            <p className="text-2xl font-bold mt-1">{courseStats.published}</p>
            <p className="text-xs text-[#2C365E]/70 mt-1">
              published • {courseStats.drafts} drafts
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#2C365E]">Net (est.)</p>
            <p className="text-2xl font-bold mt-1">
              {centsToMoney(totals.net_cents, currency)}
            </p>
            <p className="text-xs text-[#2C365E]/70 mt-1">
              creator earned minus refunds (if provided)
            </p>
          </div>
        </div>

        {/* Per-course table */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/30 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#2C365E]/10 p-2 rounded-xl text-[#2C365E] mt-0.5">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Per-Course Revenue</h2>
                <p className="text-xs text-[#2C365E]/70">
                  Sorted by creator earned (highest first).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="bg-white/70"
                onClick={() => navigate("/creator/dashboard")}
              >
                Manage Courses
              </Button>
            </div>
          </div>

          {sortedRows.length === 0 ? (
            <div className="text-sm text-[#2C365E]/70 py-10 text-center">
              No revenue rows yet for this range.
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="block lg:hidden space-y-3">
                {sortedRows.map((r, i) => {
                  const rowKey = `${r?.course_id ?? r?.id ?? "row"}-${i}`;
                  const isPaid = !!r.is_paid;
                  const price = centsToMoney(r.price_cents || 0, currency);
                  const gross = centsToMoney(r.gross_cents || 0, currency);
                  const fee = centsToMoney(r.platform_fee_cents || 0, currency);
                  const earned = centsToMoney(r.creator_earned_cents || 0, currency);

                  return (
                    <div
                      key={rowKey}
                      className="bg-white/70 rounded-2xl border border-[#2C365E]/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-[#222222] line-clamp-1">
                            {r.title || "Untitled Course"}
                          </p>
                          <p className="text-xs text-[#2C365E]/60">
                            #{r.course_id || r.id}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
                            isPaid
                              ? "bg-[#EA7125]/10 text-[#EA7125] border-[#EA7125]/20"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {isPaid ? "Paid" : "Free"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-[#2C365E]/70">Creator Earned</p>
                          <p className="font-semibold">{earned}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2C365E]/70">Gross</p>
                          <p className="font-semibold">{gross}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2C365E]/70">Platform Fee</p>
                          <p className="font-semibold">{fee}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2C365E]/70">Orders</p>
                          <p className="font-semibold">{Number(r.orders_count || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2C365E]/70">Learners</p>
                          <p className="font-semibold">
                            {Number(r.student_count || r.enrollment_count || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#2C365E]/70">Modules</p>
                          <p className="font-semibold">{Number(r.module_count || 0)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                          className="bg-[#2C365E] hover:bg-[#2C365E]/90 w-full"
                          onClick={() => openCourseManage(r.course_id || r.id)}
                        >
                          Manage Course
                        </Button>

                        {isPaid ? (
                          <Button
                            variant="outline"
                            className="w-full bg-white/70"
                            onClick={() => {
                              const c = courseById.get(String(r.course_id || r.id));
                              const stripeLink = c?.stripe_link || c?.payments?.stripe_link; // supports future shapes
                              if (!stripeLink) {
                                toast(
                                 "No Stripe link yet",
                                  {description:
                                    "This course does not have a Stripe link saved yet.",
                                });
                                return;
                              }
                              window.open(stripeLink, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Stripe Link
                          </Button>
                        ) : null}

                        {isPaid ? (
                          <div className="text-xs text-[#2C365E]/60 mt-1 sm:hidden">
                            Price: {price}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block w-full overflow-x-auto">
                <table className="min-w-[1050px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#2C365E]">
                      <th className="py-3 pr-4">Course</th>
                      <th className="py-3 pr-4">Paid</th>
                      <th className="py-3 pr-4">Price</th>
                      <th className="py-3 pr-4">Orders</th>
                      <th className="py-3 pr-4">Gross</th>
                      <th className="py-3 pr-4">Platform Fee</th>
                      <th className="py-3 pr-4">Creator Earned</th>
                      <th className="py-3 pr-4">Learners</th>
                      <th className="py-3 pr-4">Modules</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedRows.map((r, i) => {
                      // ✅ fixed "unique key" warning (always unique)
                      const rowKey = `${r?.course_id ?? r?.id ?? "row"}-${i}`;

                      const isPaid = !!r.is_paid;
                      const price = centsToMoney(r.price_cents || 0, currency);
                      const gross = centsToMoney(r.gross_cents || 0, currency);
                      const fee = centsToMoney(r.platform_fee_cents || 0, currency);
                      const earned = centsToMoney(r.creator_earned_cents || 0, currency);

                      return (
                        <tr key={rowKey} className="border-t border-[#2C365E]/10">
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-[#222222] line-clamp-1">
                              {r.title || "Untitled Course"}
                            </div>
                            <div className="text-xs text-[#2C365E]/60">
                              #{r.course_id || r.id}
                            </div>
                          </td>

                          <td className="py-3 pr-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${
                                isPaid
                                  ? "bg-[#EA7125]/10 text-[#EA7125] border-[#EA7125]/20"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              {isPaid ? "Paid" : "Free"}
                            </span>
                          </td>

                          <td className="py-3 pr-4">{isPaid ? price : "—"}</td>
                          <td className="py-3 pr-4">{Number(r.orders_count || 0)}</td>
                          <td className="py-3 pr-4">{gross}</td>
                          <td className="py-3 pr-4">{fee}</td>
                          <td className="py-3 pr-4 font-semibold">{earned}</td>
                          <td className="py-3 pr-4">
                            {Number(r.student_count || r.enrollment_count || 0)}
                          </td>
                          <td className="py-3 pr-4">{Number(r.module_count || 0)}</td>

                          <td className="py-3 pr-4">
                            <div className="flex gap-2">
                              <Button
                                className="bg-[#2C365E] hover:bg-[#2C365E]/90"
                                onClick={() => openCourseManage(r.course_id || r.id)}
                              >
                                Manage
                              </Button>

                              {isPaid ? (
                                <Button
                                  variant="outline"
                                  className="bg-white/70"
                                  onClick={() => {
                                    const c = courseById.get(String(r.course_id || r.id));
                                    const stripeLink =
                                      c?.stripe_link || c?.payments?.stripe_link; // supports future shapes
                                    if (!stripeLink) {
                                      toast(
                                    "No Stripe link yet",
                                    {  description:
                                          "This course does not have a Stripe link saved yet.",
                                      });
                                      return;
                                    }
                                    window.open(
                                      stripeLink,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Stripe
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-[#2C365E]/60">
          Note: payout timing depends on Stripe transfer settings and creator account status.
        </div>
      </div>

      {/* Customization Modal */}
      {needsCustomization && (
        <CreatorCustomizeModal
          open={needsCustomization}
          onClose={(openState) => setNeedsCustomization(openState)}
          onConfirm={handleCustomizationComplete}
        />
      )}
    </div>
  );
}
