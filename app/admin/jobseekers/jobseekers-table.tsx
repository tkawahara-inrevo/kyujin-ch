"use client";

import Link from "next/link";
import { useState } from "react";
import { UserActiveToggle } from "./user-active-toggle";

export type JobseekerRow = {
  id: string;
  name: string;
  email: string;
  applicationsCount: number;
  isActive: boolean;
  createdAt: string;
};

export function JobseekersTable({ users }: { users: JobseekerRow[] }) {
  const [selectedUser, setSelectedUser] = useState<JobseekerRow | null>(null);

  return (
    <>
      <div className="mt-3 rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="xl:hidden">
          {users.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#aaa]">
              求職者がまだいません
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_52px_72px] gap-2 border-b border-[#f0f0f0] px-4 py-3 text-[11px] font-semibold text-[#888]">
                <span className="truncate">求職者</span>
                <span className="text-right">応募</span>
                <span className="text-center">状態</span>
              </div>
              <div>
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_52px_72px] items-center gap-2 border-b border-[#f8f8f8] px-4 py-3 text-left transition hover:bg-[#fafafa]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#333]">
                        {user.name}
                      </p>
                      <p className="truncate text-[11px] text-[#999]">{user.email}</p>
                    </div>
                    <span className="text-right text-[13px] text-[#555]">
                      {user.applicationsCount}
                    </span>
                    <span className="flex justify-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          user.isActive
                            ? "bg-[#d1fae5] text-[#059669]"
                            : "bg-[#fee2e2] text-[#dc2626]"
                        }`}
                      >
                        {user.isActive ? "有効" : "停止"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">氏名</th>
                <th className="px-5 py-3 font-semibold">メール</th>
                <th className="px-5 py-3 font-semibold">応募数</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">登録日</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#aaa]">
                    求職者がまだいません
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#f8f8f8] hover:bg-[#fafafa]"
                  >
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link
                        href={`/admin/jobseekers/${user.id}`}
                        className="hover:text-[#2f6cff] hover:underline"
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">{user.email}</td>
                    <td className="px-5 py-3 text-[#555]">{user.applicationsCount}</td>
                    <td className="px-5 py-3">
                      <UserActiveToggle userId={user.id} isActive={user.isActive} />
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 xl:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0"
          />
          <div className="relative max-h-[85vh] w-full rounded-t-[24px] bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.14)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d1d5db]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#888]">
                  {new Date(selectedUser.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <h3 className="mt-1 truncate text-[16px] font-bold text-[#1e3a5f]">
                  {selectedUser.name}
                </h3>
                <p className="truncate text-[12px] text-[#888]">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[12px] font-bold text-[#666]"
              >
                閉じる
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">応募数</p>
                  <p className="mt-1 text-[16px] font-bold text-[#333]">
                    {selectedUser.applicationsCount}
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#888]">状態</p>
                  <div className="mt-2">
                    <UserActiveToggle
                      userId={selectedUser.id}
                      isActive={selectedUser.isActive}
                    />
                  </div>
                </div>
              </div>
              <Link
                href={`/admin/jobseekers/${selectedUser.id}`}
                className="flex items-center justify-center rounded-[12px] bg-[#2f6cff] px-4 py-3 text-[13px] font-bold text-white"
              >
                求職者詳細を見る
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
