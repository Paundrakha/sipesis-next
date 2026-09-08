"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Permission, PermissionStatus } from "@/types";

function generateToken(): string {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const random = Math.floor(100 + Math.random() * 900);
  return `DSP-${dateStr}-${random}`;
}

function checkIsLate(deadline: string): boolean {
  if (!deadline) return false;
  const now = new Date();
  const [h, m] = deadline.split(":").map(Number);
  const deadlineDate = new Date();
  deadlineDate.setHours(h, m, 0, 0);
  return now > deadlineDate;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "permissions"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            token: d.token || "",
            groupId: d.groupId || "",
            name: d.name || "",
            nis: d.nis || "",
            className: d.className || "",
            period: d.period || "",
            purpose: d.purpose || "",
            outTime: d.outTime || "",
            deadline: d.deadline || "",
            photo: d.photo || "",
            photoOut: d.photoOut || null,
            photoIn: d.photoIn || null,
            created: d.created || "",
            createdAt: d.createdAt || "",
            status: d.status || "pending",
            approvedAt: d.approvedAt || null,
            returnedAt: d.returnedAt || null,
            rejectedAt: d.rejectedAt || null,
            isLate: d.isLate || false,
          } as Permission;
        });
        setPermissions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore realtime error:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const addPermission = useCallback(
    async (items: Omit<Permission, "id">[]) => {
      for (const item of items) {
        await addDoc(collection(db, "permissions"), item);
      }
    },
    []
  );

  const createGroupPermission = useCallback(
    async (
      students: { name: string; nis: string; className: string; photo: string }[],
      common: { purpose: string; period: string; outTime: string; deadline: string }
    ) => {
      const token = generateToken();
      const groupId = `GRP-${Date.now()}`;
      const now = new Date();
      const created = now.toLocaleString("id-ID");
      const createdAt = now.toISOString();

      const docs = students.map((s) => ({
        token,
        groupId,
        name: s.name,
        nis: s.nis,
        className: s.className,
        period: common.period,
        purpose: common.purpose,
        outTime: common.outTime,
        deadline: common.deadline,
        photo: s.photo,
        photoOut: null,
        photoIn: null,
        created,
        createdAt,
        status: "pending" as PermissionStatus,
        approvedAt: null,
        returnedAt: null,
        rejectedAt: null,
        isLate: false,
      }));

      await addPermission(docs);
      return token;
    },
    [addPermission]
  );

  const updateStatus = useCallback(
    async (id: string, status: PermissionStatus, extra?: Record<string, unknown>) => {
      const ref = doc(db, "permissions", id);
      const updates: Record<string, unknown> = { status, ...extra };
      if (status === "returned") {
        const perm = permissions.find((p) => p.id === id);
        if (perm) {
          updates.isLate = checkIsLate(perm.deadline);
        }
      }
      await updateDoc(ref, updates);
    },
    [permissions]
  );

  const approvePermission = useCallback(
    async (id: string) => {
      await updateStatus(id, "approved", {
        approvedAt: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    [updateStatus]
  );

  const markOut = useCallback(
    async (id: string, photoOut?: string) => {
      await updateStatus(id, "out", photoOut ? { photoOut } : {});
    },
    [updateStatus]
  );

  const markReturned = useCallback(
    async (id: string, photoIn?: string) => {
      await updateStatus(id, "returned", {
        returnedAt: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ...(photoIn ? { photoIn } : {}),
      });
    },
    [updateStatus]
  );

  const rejectPermission = useCallback(
    async (id: string) => {
      await updateStatus(id, "rejected", {
        rejectedAt: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    [updateStatus]
  );

  const getByToken = useCallback(
    async (token: string): Promise<Permission[]> => {
      const q = query(collection(db, "permissions"), where("token", "==", token));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Permission));
    },
    []
  );

  return {
    permissions,
    loading,
    addPermission,
    createGroupPermission,
    approvePermission,
    markOut,
    markReturned,
    rejectPermission,
    getByToken,
  };
}
