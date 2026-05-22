"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";

import {
  Award,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Gift,
  Medal,
  Plus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type IconOption =
  | {
      type: "lucide";
      name: string;
      icon: LucideIcon;
    }
  | {
      type: "emoji";
      name: string;
      emoji: string;
    };

type BadgeStats = {
  total_badges: number;
  active_automations: number;
  total_reward_points: number;
  total_earned: number;
};

type BadgeItem = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  icon?: string | null;
  badge_type?: string | null;
  color?: string | null;
  reward_points: number;
  condition_type?: string | null;
  condition_value?: number | null;
  course_id?: string | null;
  course_title?: string | null;
  is_automation: boolean;
  status?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_earned?: number;
};

type BadgeForm = {
  name: string;
  code: string;
  description: string;
  badge_type: string;
  icon: string;
  color: string;
  reward_points: string;
  condition_type: string;
  condition_value: string;
  is_automation: boolean;
  status: string;
};

const iconOptions: IconOption[] = [
  { type: "lucide", name: "Flame", icon: Flame },
  { type: "lucide", name: "Star", icon: Star },
  { type: "lucide", name: "Crown", icon: Crown },
  { type: "lucide", name: "Trophy", icon: Trophy },
  { type: "lucide", name: "BadgeCheck", icon: BadgeCheck },
  { type: "lucide", name: "Award", icon: Award },
  { type: "lucide", name: "Target", icon: Target },
  { type: "lucide", name: "Gift", icon: Gift },
  { type: "lucide", name: "Zap", icon: Zap },
  { type: "lucide", name: "ShieldCheck", icon: ShieldCheck },
  { type: "lucide", name: "Rocket", icon: Rocket },
  { type: "lucide", name: "Brain", icon: Brain },
  { type: "lucide", name: "Medal", icon: Medal },
  { type: "lucide", name: "Sparkles", icon: Sparkles },

  { type: "emoji", name: "Cup", emoji: "🏆" },
  { type: "emoji", name: "MedalEmoji", emoji: "🏅" },
  { type: "emoji", name: "StarEmoji", emoji: "⭐" },
  { type: "emoji", name: "Fire", emoji: "🔥" },
  { type: "emoji", name: "RocketEmoji", emoji: "🚀" },
  { type: "emoji", name: "Diamond", emoji: "💎" },
  { type: "emoji", name: "TargetEmoji", emoji: "🎯" },
  { type: "emoji", name: "BrainEmoji", emoji: "🧠" },
  { type: "emoji", name: "Book", emoji: "📘" },
  { type: "emoji", name: "Certificate", emoji: "📜" },
  { type: "emoji", name: "Idea", emoji: "💡" },
  { type: "emoji", name: "CrownEmoji", emoji: "👑" },
  { type: "emoji", name: "GiftEmoji", emoji: "🎁" },
  { type: "emoji", name: "Check", emoji: "✅" },
  { type: "emoji", name: "Party", emoji: "🎉" },
  { type: "emoji", name: "Muscle", emoji: "💪" },
];

const defaultForm: BadgeForm = {
  name: "",
  code: "",
  description: "",
  badge_type: "achievement",
  icon: "Cup",
  color: "orange",
  reward_points: "",
  condition_type: "course_completed",
  condition_value: "1",
  is_automation: true,
  status: "active",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function getIconData(iconName?: string | null) {
  return (
    iconOptions.find((item) => item.name === iconName) ||
    iconOptions.find((item) => item.name === "Cup") ||
    iconOptions[0]
  );
}

function renderBadgeIcon(iconName?: string | null, size = 24) {
  const iconData = getIconData(iconName);

  if (iconData.type === "emoji") {
    return <span className="text-2xl leading-none">{iconData.emoji}</span>;
  }

  const Icon = iconData.icon;
  return <Icon size={size} />;
}

function getBadgeTypeLabel(type?: string | null) {
  const map: Record<string, string> = {
    achievement: "Thành tích",
    streak: "Streak",
    quiz: "Quiz",
    course: "Khóa học",
    learning_path: "Lộ trình học tập",
    leaderboard: "Xếp hạng",
    skill: "Kỹ năng",
  };

  return map[type || ""] || type || "Chưa phân loại";
}

function getConditionLabel(condition?: string | null) {
  const map: Record<string, string> = {
    course_completed: "Hoàn thành khóa học",
    quiz_score: "Đạt điểm bài test",
    streak_days: "Học liên tục nhiều ngày",
    learning_path_completed: "Hoàn thành lộ trình học tập",
    leaderboard_top: "Đạt top bảng xếp hạng",
    skill_completed: "Hoàn thành kỹ năng",
  };

  return map[condition || ""] || condition || "Chưa cấu hình";
}

function getStatusLabel(badge: BadgeItem) {
  if (badge.status === "deleted") return "Đã xóa";
  if (badge.status === "draft") return "Nháp";
  if (badge.is_automation) return "Đang bật";
  return "Tắt automation";
}

function getStatusClass(badge: BadgeItem) {
  if (badge.status === "draft") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  if (badge.is_automation) {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-slate-100 text-slate-600 border border-slate-200";
}

export default function LMSAdminBadgesPage() {
  const [form, setForm] = useState<BadgeForm>(defaultForm);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [stats, setStats] = useState<BadgeStats>({
    total_badges: 0,
    active_automations: 0,
    total_reward_points: 0,
    total_earned: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedIconData = useMemo(() => {
    return getIconData(form.icon);
  }, [form.icon]);

  async function fetchStats() {
    const response = await fetch(`${API_BASE_URL}/api/badges/stats`, {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể lấy thống kê huy hiệu");
    }

    setStats(result.data);
  }

  async function fetchBadges() {
    const response = await fetch(`${API_BASE_URL}/api/badges`, {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể lấy danh sách huy hiệu");
    }

    setBadges(result.data || []);
  }

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchStats(), fetchBadges()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải dữ liệu huy hiệu"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function updateForm<K extends keyof BadgeForm>(key: K, value: BadgeForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên huy hiệu");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        icon: form.icon,
        badge_type: form.badge_type,
        color: form.color,
        reward_points: Number(form.reward_points || 0),
        condition_type: form.condition_type,
        condition_value: Number(form.condition_value || 0),
        course_id: null,
        is_automation: form.is_automation,
        status: form.status,
      };

      const response = await fetch(`${API_BASE_URL}/api/badges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tạo huy hiệu");
      }

      setMessage("Tạo huy hiệu thành công");
      setForm(defaultForm);
      await loadPageData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo huy hiệu"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAutomation(id: string) {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/badges/${id}/toggle-automation`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể cập nhật automation");
      }

      setMessage("Cập nhật automation thành công");
      await loadPageData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi cập nhật automation"
      );
    }
  }

  async function handleDeleteBadge(id: string) {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa huy hiệu này không?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/api/badges/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể xóa huy hiệu");
      }

      setMessage("Xóa huy hiệu thành công");
      await loadPageData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa huy hiệu"
      );
    }
  }

  return (
    <AppShell workspace="lms-admin" title="Kho huy hiệu">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Badge Automation
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Kho huy hiệu & automation
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Tạo huy hiệu học tập, chọn icon, cấu hình điểm thưởng và điều
                kiện automation cấp huy hiệu cho học viên.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPageData}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <RefreshCw size={18} />
              Làm mới dữ liệu
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(stats.total_badges)}
            </p>
            <p className="text-sm text-slate-500">Tổng huy hiệu</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(stats.active_automations)}
            </p>
            <p className="text-sm text-slate-500">Automation hoạt động</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Gift className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(stats.total_reward_points)}
            </p>
            <p className="text-sm text-slate-500">Điểm thưởng đã cấp</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Trophy className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(stats.total_earned)}
            </p>
            <p className="text-sm text-slate-500">Lượt nhận huy hiệu</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
          <SectionCard title="Tạo huy hiệu mới">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Tên huy hiệu"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <input
                value={form.code}
                onChange={(event) => updateForm("code", event.target.value)}
                placeholder="Mã huy hiệu, ví dụ FIRST_COURSE"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <select
                value={form.badge_type}
                onChange={(event) =>
                  updateForm("badge_type", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="achievement">Thành tích</option>
                <option value="streak">Streak</option>
                <option value="quiz">Quiz</option>
                <option value="course">Khóa học</option>
                <option value="learning_path">Lộ trình học tập</option>
                <option value="leaderboard">Xếp hạng</option>
                <option value="skill">Kỹ năng</option>
              </select>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Icon đang chọn
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                    {selectedIconData.type === "emoji" ? (
                      <span className="text-3xl">
                        {selectedIconData.emoji}
                      </span>
                    ) : (
                      (() => {
                        const Icon = selectedIconData.icon;
                        return <Icon size={28} />;
                      })()
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">
                      {selectedIconData.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      Preview huy hiệu hiện tại
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Chọn icon huy hiệu
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-7 xl:grid-cols-8">
                    {iconOptions.map((item) => {
                      const isActive = form.icon === item.name;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          title={item.name}
                          onClick={() => updateForm("icon", item.name)}
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-200 ${
                            isActive
                              ? "border-orange-500 bg-orange-500 text-white shadow-md"
                              : "border-slate-200 bg-white text-orange-600 hover:border-orange-300 hover:bg-orange-50"
                          }`}
                        >
                          {item.type === "emoji" ? (
                            <span className="text-2xl leading-none">
                              {item.emoji}
                            </span>
                          ) : (
                            <item.icon size={22} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <input
                type="number"
                min="0"
                value={form.reward_points}
                onChange={(event) =>
                  updateForm("reward_points", event.target.value)
                }
                placeholder="Điểm thưởng"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <select
                value={form.condition_type}
                onChange={(event) =>
                  updateForm("condition_type", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="course_completed">Hoàn thành khóa học</option>
                <option value="quiz_score">Quiz trên số điểm yêu cầu</option>
                <option value="streak_days">Học liên tục nhiều ngày</option>
                <option value="learning_path_completed">
                  Hoàn thành lộ trình học tập
                </option>
                <option value="leaderboard_top">Top leaderboard</option>
                <option value="skill_completed">Hoàn thành kỹ năng</option>
              </select>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Giá trị điều kiện
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.condition_value}
                  onChange={(event) =>
                    updateForm("condition_value", event.target.value)
                  }
                  placeholder="Ví dụ: 1 khóa học, 7 ngày học liên tục, hoặc 90 điểm"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Đây là số mốc để hệ thống xét điều kiện cấp huy hiệu. Ví dụ: điều kiện
                  “Hoàn thành khóa học” và giá trị là 1 nghĩa là học viên hoàn thành 1 khóa
                  học sẽ được cấp huy hiệu.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="draft">Nháp</option>
                </select>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  Automation
                  <input
                    type="checkbox"
                    checked={form.is_automation}
                    onChange={(event) =>
                      updateForm("is_automation", event.target.checked)
                    }
                    className="h-4 w-4 accent-orange-500"
                  />
                </label>
              </div>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Mô tả huy hiệu..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={18} />
                {saving ? "Đang lưu..." : "Lưu huy hiệu"}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Danh sách huy hiệu">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                Đang tải danh sách huy hiệu...
              </div>
            ) : badges.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                Chưa có huy hiệu nào. Hãy tạo huy hiệu đầu tiên ở form bên trái.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        {renderBadgeIcon(badge.icon, 24)}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          badge
                        )}`}
                      >
                        {getStatusLabel(badge)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      {badge.name}
                    </h3>

                    {badge.code && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Mã: {badge.code}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-slate-500">
                      Loại: {getBadgeTypeLabel(badge.badge_type)}
                    </p>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Điều kiện automation
                      </p>

                      <p className="mt-1 font-bold text-slate-950">
                        {getConditionLabel(badge.condition_type)}
                        {badge.condition_value
                          ? ` • Giá trị: ${badge.condition_value}`
                          : ""}
                      </p>
                    </div>

                    {badge.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                        {badge.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-orange-50 p-3">
                      <span className="text-sm text-slate-600">
                        Điểm thưởng
                      </span>

                      <span className="font-bold text-orange-600">
                        +{formatNumber(badge.reward_points)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <span className="text-sm text-slate-600">
                        Lượt nhận
                      </span>

                      <span className="font-bold text-slate-950">
                        {formatNumber(badge.total_earned || 0)}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAutomation(badge.id)}
                        className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        {badge.is_automation ? "Tắt auto" : "Bật auto"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Luồng automation huy hiệu">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Set điều kiện",
                desc: "Quản trị LMS cấu hình điều kiện nhận huy hiệu.",
              },
              {
                icon: Zap,
                title: "Automation kiểm tra",
                desc: "Hệ thống tự động kiểm tra dữ liệu học tập.",
              },
              {
                icon: CheckCircle2,
                title: "Cấp huy hiệu",
                desc: "Học viên đạt điều kiện sẽ được cấp tự động.",
              },
              {
                icon: Gift,
                title: "Cộng điểm",
                desc: "Điểm gamification được cộng vào hồ sơ.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <Icon className="text-orange-600" size={22} />

                  <h3 className="mt-3 font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}