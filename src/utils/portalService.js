import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where,
  serverTimestamp, writeBatch, onSnapshot,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { assignGroups } from './shuffle';
import { exportGroupsToExcel } from './exportExcel';

// ── PORTALS ──

export async function createPortal(userId, data) {
  const ref_ = await addDoc(collection(db, 'portals'), {
    ...data,
    ownerId: userId,
    isOpen: true,
    studentCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref_.id;
}

export async function updatePortal(portalId, data) {
  await updateDoc(doc(db, 'portals', portalId), data);
}

export async function deletePortal(portalId) {
  await deleteDoc(doc(db, 'portals', portalId));
}

export async function getPortalBySlug(slug) {
  const q = query(collection(db, 'portals'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export function subscribeToPortal(portalId, callback) {
  return onSnapshot(doc(db, 'portals', portalId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export function subscribeToUserPortals(userId, callback) {
  // Using only where() to avoid needing a Firestore composite index.
  // We sort client-side by createdAt instead.
  const q = query(
    collection(db, 'portals'),
    where('ownerId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    const portals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    portals.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    callback(portals);
  }, (error) => {
    console.error('subscribeToUserPortals error:', error.message);
    callback([]);
  });
}

// ── STUDENTS ──

export async function registerStudent(portalId, studentData) {
  const studentRef = await addDoc(
    collection(db, 'portals', portalId, 'students'),
    {
      ...studentData,
      groupNumber: null,
      registeredAt: serverTimestamp(),
    }
  );
  // Increment student count
  const portalSnap = await getDoc(doc(db, 'portals', portalId));
  const count = (portalSnap.data()?.studentCount || 0) + 1;
  await updateDoc(doc(db, 'portals', portalId), { studentCount: count });
  return studentRef.id;
}

export async function getStudents(portalId) {
  const snap = await getDocs(collection(db, 'portals', portalId, 'students'));
  const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  students.sort((a, b) => {
    const aTime = a.registeredAt?.toMillis?.() ?? 0;
    const bTime = b.registeredAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
  return students;
}

export function subscribeToStudents(portalId, callback) {
  return onSnapshot(
    collection(db, 'portals', portalId, 'students'),
    (snap) => {
      const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      students.sort((a, b) => {
        const aTime = a.registeredAt?.toMillis?.() ?? 0;
        const bTime = b.registeredAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      callback(students);
    },
    (error) => {
      console.error('subscribeToStudents error:', error.message);
      callback([]);
    }
  );
}

// ── CLOSE PORTAL & SHUFFLE ──

export async function closePortalAndShuffle(portalId, groupSize, portalName, questions = []) {
  // 1. Fetch all students
  const students = await getStudents(portalId);

  // 2. Shuffle & assign
  const grouped = assignGroups(students, groupSize);

  // 3. Batch write group numbers
  const batch = writeBatch(db);
  grouped.forEach(s => {
    batch.update(doc(db, 'portals', portalId, 'students', s.id), {
      groupNumber: s.groupNumber,
    });
  });

  // 4. Close the portal
  batch.update(doc(db, 'portals', portalId), {
    isOpen: false,
    closedAt: serverTimestamp(),
  });

  await batch.commit();

  // 5. Export Excel
  exportGroupsToExcel(grouped, portalName, questions);

  return grouped;
}

// ── BACKGROUND IMAGE ──

export async function uploadPortalBackground(portalId, file) {
  const fileRef = ref(storage, `portals/${portalId}/background`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  await updateDoc(doc(db, 'portals', portalId), { bgImageUrl: url });
  return url;
}

export async function removePortalBackground(portalId) {
  try {
    const fileRef = ref(storage, `portals/${portalId}/background`);
    await deleteObject(fileRef);
  } catch (_) {}
  await updateDoc(doc(db, 'portals', portalId), { bgImageUrl: null });
}
