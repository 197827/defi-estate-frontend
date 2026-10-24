'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveKycSubmission,
  listPendingKycSubmissions,
  rejectKycSubmission,
  type KycSubmission,
} from '@/services/api';

export default function OperatorKycPage() {
  const router = useRouter();
  const [isOperator, setIsOperator] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkOperator() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          if (!cancelled) {
            setIsOperator(false);
          }
          return;
        }
        const data = (await response.json()) as { role?: string };
        if (!cancelled) {
          setIsOperator(data.role === 'operator');
        }
      } catch {
        if (!cancelled) {
          setIsOperator(false);
        }
      }
    }

    void checkOperator();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPendingKycSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load pending KYC submissions.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOperator) {
      void loadSubmissions();
    }
  }, [isOperator, loadSubmissions]);

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const removeSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((submission) => submission.id !== id));
    setNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleApprove = async (id: string) => {
    setActionError(null);
    setPendingAction(id);
    try {
      const note = notes[id]?.trim();
      await approveKycSubmission(id, note ? { note } : undefined);
      removeSubmission(id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Failed to approve the KYC submission.',
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionError(null);
    setPendingAction(id);
    try {
      const note = notes[id]?.trim();
      await rejectKycSubmission(id, note ? { note } : undefined);
      removeSubmission(id);
      setConfirmRejectId(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Failed to reject the KYC submission.',
      );
    } finally {
      setPendingAction(null);
    }
  };

  if (isOperator === null) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-gray-600">Checking access…</p>
      </main>
    );
  }

  if (!isOperator) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="mt-2 text-gray-600">
          You do not have permission to view this page.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Return home
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          KYC Review Queue
        </h1>
        <button
          type="button"
          onClick={() => void loadSubmissions()}
          disabled={loading}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-gray-600">Loading pending submissions…</p>
      ) : submissions.length === 0 ? (
        <p className="mt-6 text-gray-600">
          There are no pending KYC submissions.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {submissions.map((submission) => {
            const isBusy = pendingAction === submission.id;
            const isConfirming = confirmRejectId === submission.id;
            return (
              <li
                key={submission.id}
                className="rounded border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.investorName ??
                        submission.investorEmail ??
                        submission.investorId}
                    </p>
                    {submission.investorEmail && (
                      <p className="text-sm text-gray-600">
                        {submission.investorEmail}
                      </p>
                    )}
                    {submission.submittedAt && (
                      <p className="mt-1 text-xs text-gray-500">
                        Submitted{' '}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    {submission.status ?? 'pending'}
                  </span>
                </div>

                <div className="mt-3">
                  <label
                    htmlFor={`note-${submission.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Note (optional)
                  </label>
                  <textarea
                    id={`note-${submission.id}`}
                    value={notes[submission.id] ?? ''}
                    onChange={(e) =>
                      handleNoteChange(submission.id, e.target.value)
                    }
                    rows={2}
                    disabled={isBusy}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Add an optional note for this decision"
                  />
                </div>

                {isConfirming ? (
                  <div className="mt-3 rounded border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-800">
                      Are you sure you want to reject this submission? This
                      action cannot be undone.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleReject(submission.id)}
                        disabled={isBusy}
                        className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isBusy ? 'Rejecting…' : 'Confirm reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRejectId(null)}
                        disabled={isBusy}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleApprove(submission.id)}
                      disabled={isBusy}
                      className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {isBusy ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setConfirmRejectId(submission.id);
                      }}
                      disabled={isBusy}
                      className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}