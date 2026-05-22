"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;
  score: number;
  sort_order: number;
};

type AnswerMap = {
  [questionId: string]: string;
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const quizId = String(params.quizId || "");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  async function fetchQuestions() {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/quizzes/${quizId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được câu hỏi");
      }

      setQuestions(data.questions || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không lấy được câu hỏi"
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    try {
      setSubmitting(true);
      setMessage("");

      const token = getToken();

      const payload = {
        answers: Object.entries(answers).map(([question_id, selected_option]) => ({
          question_id,
          selected_option,
        })),
      };

      const response = await fetch(
        `${API_URL}/quizzes/${quizId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nộp bài thất bại");
      }

      setResult(data.result);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Nộp bài thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (quizId) {
      fetchQuestions();
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang tải bài test...
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 shadow-xl">
          <h1 className="text-4xl font-bold text-slate-900">
            Kết quả bài test
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-5">
            <div className="rounded-2xl bg-orange-50 p-5">
              <p className="text-sm text-slate-500">Điểm số</p>
              <p className="mt-2 text-4xl font-bold text-orange-600">
                {result.score}/{result.totalScore}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-sm text-slate-500">Tỷ lệ đúng</p>
              <p className="mt-2 text-4xl font-bold text-blue-600">
                {result.percent}%
              </p>
            </div>
          </div>

          <div
            className={`mt-8 rounded-2xl p-6 text-center text-2xl font-bold ${
              result.passed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {result.passed
              ? "🎉 Bạn đã vượt qua bài test"
              : "❌ Bạn chưa đạt yêu cầu"}
          </div>

          <button
            onClick={() => router.push("/employee")}
            className="mt-8 w-full rounded-2xl bg-orange-500 px-5 py-4 text-lg font-bold text-white hover:bg-orange-600"
          >
            Quay về LMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                LMS Quiz
              </p>

              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                Bài kiểm tra khóa học
              </h1>
            </div>

            <div className="rounded-2xl bg-orange-50 px-5 py-4">
              <p className="text-sm text-slate-500">Đã trả lời</p>
              <p className="text-3xl font-bold text-orange-600">
                {answeredCount}/{questions.length}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-5">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-3xl bg-white p-8 shadow-sm"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-semibold text-orange-600">
                    Câu hỏi {index + 1}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    {question.question_text}
                  </h2>
                </div>

                <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                  {question.score} điểm
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {[
                  { key: "A", value: question.option_a },
                  { key: "B", value: question.option_b },
                  { key: "C", value: question.option_c },
                  { key: "D", value: question.option_d },
                ]
                  .filter((item) => item.value)
                  .map((item) => {
                    const active = answers[question.id] === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: item.key,
                          }))
                        }
                        className={`rounded-2xl border px-5 py-4 text-left transition ${
                          active
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-bold">{item.key}.</span>{" "}
                        {item.value}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={submitQuiz}
            disabled={submitting}
            className="w-full rounded-3xl bg-orange-500 px-6 py-5 text-xl font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Đang nộp bài..." : "Nộp bài kiểm tra"}
          </button>
        </div>
      </div>
    </div>
  );
}