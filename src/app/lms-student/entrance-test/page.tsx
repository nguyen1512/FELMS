"use client";

import React, { useEffect, useMemo, useState } from "react";

type Answer = {
  id: string;
  answerText: string;
  sortOrder: number;
};

type Question = {
  id: string;
  questionText: string;
  category: string;
  difficulty: string;
  answers: Answer[];
};

type CheckedAnswer = {
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  correctAnswer: {
    id: string;
    answerText: string;
  } | null;
};

type SubmitResult = {
  attemptId: string;
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  status: string;
  submittedAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getCurrentUserId() {
  if (typeof window === "undefined") return "";

  const directKeys = ["userId", "user_id", "currentUserId"];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  const objectKeys = ["user", "currentUser", "authUser"];

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      if (parsed?.id) return parsed.id;
      if (parsed?.user_id) return parsed.user_id;
      if (parsed?.userId) return parsed.userId;
      if (parsed?.data?.id) return parsed.data.id;
      if (parsed?.data?.user?.id) return parsed.data.user.id;
      if (parsed?.user?.id) return parsed.user.id;
    } catch {
      continue;
    }
  }

  return "";
}

export default function EntranceTestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, CheckedAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");

  const userId = useMemo(() => getCurrentUserId(), []);

  const answeredCount = Object.keys(selectedAnswers).length;

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setSelectedAnswers({});
      setCheckedAnswers({});

      const response = await fetch(
        `${API_BASE_URL}/entrance-test/questions/random?limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không lấy được câu hỏi Test đầu vào");
      }

      setQuestions(json.data || []);
    } catch (err) {
      console.error("loadQuestions error:", err);
      setError("Không thể tải câu hỏi Test đầu vào. Hãy kiểm tra lại BE/API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSelectAnswer = async (questionId: string, answerId: string) => {
    try {
      setError("");

      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));

      setCheckingQuestionId(questionId);

      const response = await fetch(`${API_BASE_URL}/entrance-test/answers/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          answerId,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không kiểm tra được đáp án");
      }

      setCheckedAnswers((prev) => ({
        ...prev,
        [questionId]: {
          questionId: json.data.questionId,
          selectedAnswerId: json.data.selectedAnswerId,
          isCorrect: json.data.isCorrect,
          correctAnswer: json.data.correctAnswer,
        },
      }));
    } catch (err) {
      console.error("handleSelectAnswer error:", err);
      setError("Không thể kiểm tra đáp án. Hãy kiểm tra lại API.");
    } finally {
      setCheckingQuestionId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setError("");

      if (!userId) {
        setError(
          "Không tìm thấy userId sau khi đăng nhập. Cần kiểm tra localStorage của luồng login."
        );
        return;
      }

      if (questions.length === 0) {
        setError("Chưa có câu hỏi để nộp bài.");
        return;
      }

      const unansweredCount = questions.filter((item) => !selectedAnswers[item.id]).length;

      if (unansweredCount > 0) {
        const confirmSubmit = window.confirm(
          `Bạn còn ${unansweredCount} câu chưa chọn đáp án. Bạn vẫn muốn nộp bài?`
        );

        if (!confirmSubmit) return;
      }

      setSubmitting(true);

      const payload = {
        userId,
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedAnswerId: selectedAnswers[question.id] || null,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/entrance-test/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không nộp được bài Test đầu vào");
      }

      setResult(json.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("handleSubmit error:", err);
      setError("Không thể nộp bài Test đầu vào. Hãy kiểm tra lại BE/API.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAnswerStyle = (questionId: string, answerId: string) => {
    const checked = checkedAnswers[questionId];
    const selectedAnswerId = selectedAnswers[questionId];

    if (!checked) {
      if (selectedAnswerId === answerId) {
        return {
          borderColor: "#f97316",
          background: "#fff7ed",
          color: "#c2410c",
        };
      }

      return {
        borderColor: "#e5e7eb",
        background: "#ffffff",
        color: "#334155",
      };
    }

    if (checked.selectedAnswerId === answerId && checked.isCorrect) {
      return {
        borderColor: "#22c55e",
        background: "#f0fdf4",
        color: "#15803d",
      };
    }

    if (checked.selectedAnswerId === answerId && !checked.isCorrect) {
      return {
        borderColor: "#ef4444",
        background: "#fef2f2",
        color: "#b91c1c",
      };
    }

    if (checked.correctAnswer?.id === answerId) {
      return {
        borderColor: "#22c55e",
        background: "#f0fdf4",
        color: "#15803d",
      };
    }

    return {
      borderColor: "#e5e7eb",
      background: "#ffffff",
      color: "#64748b",
    };
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.headerCard}>
          <div>
            <p style={styles.label}>ANU LMS</p>
            <h1 style={styles.title}>Test đầu vào</h1>
            <p style={styles.description}>
              Hệ thống random 10 câu hỏi từ kho Test đầu vào. Sau khi chọn đáp án,
              bạn sẽ biết ngay câu trả lời đúng hay sai.
            </p>
          </div>

          <div style={styles.progressBox}>
            <p style={styles.progressLabel}>Tiến độ</p>
            <p style={styles.progressValue}>
              {answeredCount}/{questions.length}
            </p>
          </div>
        </section>

        {error && <div style={styles.errorBox}>{error}</div>}

        {result && (
          <section style={styles.resultBox}>
            <h2 style={styles.resultTitle}>Bạn đã hoàn thành bài Test đầu vào</h2>

            <div style={styles.resultGrid}>
              <div style={styles.resultItem}>
                <p style={styles.resultLabel}>Tổng số câu</p>
                <p style={styles.resultValue}>{result.totalQuestions}</p>
              </div>

              <div style={styles.resultItem}>
                <p style={styles.resultLabel}>Số câu đúng</p>
                <p style={{ ...styles.resultValue, color: "#16a34a" }}>
                  {result.correctAnswers}
                </p>
              </div>

              <div style={styles.resultItem}>
                <p style={styles.resultLabel}>Điểm</p>
                <p style={{ ...styles.resultValue, color: "#ea580c" }}>
                  {result.score}/10
                </p>
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <section style={styles.emptyCard}>
            <p>Đang tải câu hỏi Test đầu vào...</p>
          </section>
        ) : questions.length === 0 ? (
          <section style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>Chưa có câu hỏi Test đầu vào</h2>
            <p style={styles.emptyText}>
              Hãy thêm câu hỏi vào kho Test đầu vào trước.
            </p>
          </section>
        ) : (
          <>
            <div style={styles.questionList}>
              {questions.map((question, index) => {
                const checked = checkedAnswers[question.id];

                return (
                  <section key={question.id} style={styles.questionCard}>
                    <div style={styles.questionTop}>
                      <div>
                        <p style={styles.questionIndex}>Câu {index + 1}</p>
                        <h2 style={styles.questionText}>{question.questionText}</h2>
                      </div>

                      <span style={styles.badge}>{question.category}</span>
                    </div>

                    <div style={styles.answerList}>
                      {question.answers.map((answer) => (
                        <button
                          key={answer.id}
                          type="button"
                          onClick={() => handleSelectAnswer(question.id, answer.id)}
                          disabled={checkingQuestionId === question.id || Boolean(result)}
                          style={{
                            ...styles.answerButton,
                            ...getAnswerStyle(question.id, answer.id),
                            cursor: result ? "not-allowed" : "pointer",
                          }}
                        >
                          {answer.answerText}
                        </button>
                      ))}
                    </div>

                    {checkingQuestionId === question.id && (
                      <p style={styles.checkingText}>Đang kiểm tra đáp án...</p>
                    )}

                    {checked && (
                      <div
                        style={{
                          ...styles.feedbackBox,
                          background: checked.isCorrect ? "#f0fdf4" : "#fef2f2",
                          color: checked.isCorrect ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {checked.isCorrect ? (
                          <span>Chính xác! Đây là đáp án đúng.</span>
                        ) : (
                          <span>
                            Chưa chính xác. Đáp án đúng là:{" "}
                            <strong>{checked.correctAnswer?.answerText}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <section style={styles.submitBar}>
              <p style={styles.submitInfo}>
                Đã chọn {answeredCount}/{questions.length} câu
              </p>

              <div style={styles.submitActions}>
                <button
                  type="button"
                  onClick={loadQuestions}
                  disabled={submitting}
                  style={styles.secondaryButton}
                >
                  Làm đề khác
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || Boolean(result)}
                  style={{
                    ...styles.primaryButton,
                    opacity: submitting || result ? 0.65 : 1,
                    cursor: submitting || result ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Đang nộp bài..." : result ? "Đã nộp bài" : "Nộp bài"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px",
    color: "#0f172a",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  headerCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
    marginBottom: "18px",
  },
  label: {
    margin: 0,
    color: "#ea580c",
    fontSize: "14px",
    fontWeight: 700,
  },
  title: {
    margin: "6px 0 0",
    fontSize: "28px",
    fontWeight: 800,
  },
  description: {
    margin: "10px 0 0",
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "720px",
    lineHeight: 1.6,
  },
  progressBox: {
    minWidth: "120px",
    background: "#fff7ed",
    borderRadius: "14px",
    padding: "14px",
    textAlign: "right",
  },
  progressLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
  progressValue: {
    margin: "4px 0 0",
    color: "#ea580c",
    fontSize: "24px",
    fontWeight: 800,
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: "14px",
    padding: "14px 16px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: 600,
  },
  resultBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "18px",
  },
  resultTitle: {
    margin: 0,
    color: "#15803d",
    fontSize: "18px",
    fontWeight: 800,
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "14px",
  },
  resultItem: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "14px",
  },
  resultLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
  resultValue: {
    margin: "6px 0 0",
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: 800,
  },
  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },
  emptyTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: 800,
  },
  emptyText: {
    margin: "8px 0 0",
    fontSize: "14px",
  },
  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  questionCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
  },
  questionTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
  },
  questionIndex: {
    margin: 0,
    color: "#ea580c",
    fontSize: "14px",
    fontWeight: 800,
  },
  questionText: {
    margin: "6px 0 0",
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  badge: {
    height: "fit-content",
    background: "#f1f5f9",
    color: "#475569",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  answerList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  answerButton: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "13px 15px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.15s ease",
  },
  checkingText: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  feedbackBox: {
    marginTop: "14px",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 700,
  },
  submitBar: {
    position: "sticky",
    bottom: "0",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px",
    marginTop: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.14)",
  },
  submitInfo: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },
  submitActions: {
    display: "flex",
    gap: "10px",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    border: "none",
    background: "#ea580c",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 800,
  },
};