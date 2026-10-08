import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  MessageSquare,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { IConnection } from "../types/index.ts";
import { api } from "../services/api.ts";
import { useAuth } from "../context/AuthContext.tsx";

interface Props {
  onStartChat: (userId: string) => void;
  onOpenDiscover: () => void;
}

export const ConnectionsView: React.FC<Props> = ({
  onStartChat,
  onOpenDiscover,
}) => {
  const { user, refreshCounters } = useAuth();

  const [subTab, setSubTab] = useState<
    "connected" | "incoming" | "outgoing"
  >("connected");

  const [accepted, setAccepted] = useState<IConnection[]>([]);
  const [incoming, setIncoming] = useState<IConnection[]>([]);
  const [outgoing, setOutgoing] = useState<IConnection[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);

    try {
      const res = await api.getConnections();

      setAccepted(res.accepted || []);
      setIncoming(res.incoming || []);
      setOutgoing(res.outgoing || []);

      await refreshCounters();
    } catch (err) {
      console.error("Fetch connections error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const handleRespond = async (
    connectionId: string,
    action: "accept" | "decline"
  ) => {
    setActionLoadingId(connectionId);

    try {
      await api.respondConnection(connectionId, action);
      await fetchConnections();
    } catch (err) {
      console.error("Respond connection error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this connection?"
      )
    ) {
      return;
    }

    setActionLoadingId(connectionId);

    try {
      await api.deleteConnection(connectionId);
      await fetchConnections();
    } catch (err) {
      console.error("Delete connection error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-14 text-center bg-white border border-gray-200 rounded-2xl card-shadow space-y-3">
        <Users className="w-10 h-10 text-gray-400 mx-auto" />

        <h3 className="text-lg font-bold text-gray-900">
          Sign In to View Your Hobby Network
        </h3>

        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Manage your connections, accept invites from other hobbyists,
          and exchange messages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Hobby Network
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            People you collaborate with, shared passion partners, and
            incoming connection invites.
          </p>
        </div>

        <button
          onClick={fetchConnections}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              loading ? "animate-spin" : ""
            }`}
          />

          <span>Refresh</span>
        </button>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setSubTab("connected")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            subTab === "connected"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />

          Connected Partners ({accepted.length})
        </button>

        <button
          onClick={() => setSubTab("incoming")}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            subTab === "incoming"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <UserCheck className="w-4 h-4" />

          Incoming Requests ({incoming.length})

          {incoming.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => setSubTab("outgoing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            subTab === "outgoing"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Clock className="w-4 h-4" />

          Sent Requests ({outgoing.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />

          <span className="text-xs font-medium">
            Loading network...
          </span>
        </div>
      ) : subTab === "connected" ? (
        accepted.length === 0 ? (
          <div className="p-14 text-center bg-white rounded-2xl border border-gray-200 card-shadow space-y-3">
            <Users className="w-10 h-10 text-gray-400 mx-auto" />

            <h3 className="text-base font-bold text-gray-900">
              No active connections yet
            </h3>

            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Find hobbyists in the Discover tab or accept incoming
              requests to start building your network.
            </p>

            <button
              onClick={onOpenDiscover}
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Explore Discover & Matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accepted.map((conn) => {
              /*
               * IMPORTANT:
               * A connection can exist even when its referenced user
               * has been deleted. In that case conn.partner is null.
               *
               * We skip that connection instead of doing:
               * conn.partner.avatar
               *
               * which caused your original crash.
               */
              if (!conn.partner) {
                return null;
              }

              return (
                <div
                  key={conn._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between card-shadow hover:-translate-y-0.5 hover:border-gray-300 card-shadow-hover transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            conn.partner.avatar ||
                            "https://ui-avatars.com/api/?name=User"
                          }
                          alt={conn.partner.name || "User"}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />

                        <div>
                          <h4 className="font-bold text-sm text-gray-900">
                            {conn.partner.name}
                          </h4>

                          <div className="text-xs text-gray-500">
                            @{conn.partner.username}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Connected
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {conn.partner.bio}
                    </p>

                    {conn.hobbyContext && (
                      <div className="text-[11px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        Primary interest:{" "}
                        <span className="font-semibold">
                          {conn.hobbyContext}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 pt-1">
                      {conn.partner.hobbies?.map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium"
                        >
                          {h.hobbyName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        onStartChat(conn.partner._id)
                      }
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />

                      Direct Chat
                    </button>

                    <button
                      onClick={() => handleDelete(conn._id)}
                      disabled={actionLoadingId === conn._id}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-xl transition"
                      title="Remove connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : subTab === "incoming" ? (
        incoming.length === 0 ? (
          <div className="p-14 text-center bg-white rounded-2xl border border-gray-200 card-shadow text-gray-500 text-sm">
            No pending incoming connection requests.
          </div>
        ) : (
          <div className="space-y-3">
            {incoming.map((conn) => {
              /*
               * Prevent crash if the requesting user no longer exists.
               */
              if (!conn.partner) {
                return null;
              }

              return (
                <div
                  key={conn._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-shadow"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={
                        conn.partner.avatar ||
                        "https://ui-avatars.com/api/?name=User"
                      }
                      alt={conn.partner.name || "User"}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {conn.partner.name}
                        </span>

                        <span className="text-xs text-gray-500">
                          @{conn.partner.username}
                        </span>
                      </div>

                      {conn.introMessage && (
                        <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200/60 italic">
                          "{conn.introMessage}"
                        </p>
                      )}

                      {conn.hobbyContext && (
                        <div className="text-[11px] text-indigo-600 font-medium">
                          Interest topic: {conn.hobbyContext}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        handleRespond(conn._id, "accept")
                      }
                      disabled={actionLoadingId === conn._id}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />

                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleRespond(conn._id, "decline")
                      }
                      disabled={actionLoadingId === conn._id}
                      className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />

                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : outgoing.length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-gray-200 card-shadow text-gray-500 text-sm">
          No outgoing connection requests waiting for response.
        </div>
      ) : (
        <div className="space-y-3">
          {outgoing.map((conn) => {
            /*
             * Prevent crash if the requested user no longer exists.
             */
            if (!conn.partner) {
              return null;
            }

            return (
              <div
                key={conn._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 card-shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      conn.partner.avatar ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt={conn.partner.name || "User"}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        {conn.partner.name}
                      </span>

                      <span className="text-xs text-gray-500">
                        @{conn.partner.username}
                      </span>
                    </div>

                    {conn.introMessage && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
                        "{conn.introMessage}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />

                    Pending Response
                  </span>

                  <button
                    onClick={() => handleDelete(conn._id)}
                    disabled={actionLoadingId === conn._id}
                    className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                    title="Cancel request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

