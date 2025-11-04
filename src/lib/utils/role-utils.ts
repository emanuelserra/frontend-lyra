import { IconType } from 'react-icons';
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaUsers,
  FaBook,
  FaClipboardCheck,
  FaGraduationCap,
  FaUserTie,
  FaUser
} from 'react-icons/fa';

export type UserRole = 'admin' | 'professor' | 'tutor' | 'student';

export interface MenuItem {
  name: string;
  icon: IconType;
  href: string;
}

/**
 * Restituisce il menu items basato sul ruolo dell'utente
 * @param role - Ruolo dell'utente (admin, professor, tutor, student)
 * @returns Array di menu items con nome, icona e link
 */
export function getMenuItemsByRole(role: UserRole): MenuItem[] {
  const menus: Record<UserRole, MenuItem[]> = {
    admin: [
      { name: 'Dashboard', icon: FaHome, href: '/home' },
      { name: 'Utenti', icon: FaUsers, href: '/users' },
      { name: 'Studenti', icon: FaUserGraduate, href: '/students' },
      { name: 'Professori', icon: FaUserTie, href: '/professors' },
      { name: 'Corsi', icon: FaChalkboardTeacher, href: '/courses' },
      { name: 'Materie', icon: FaBook, href: '/subjects' },
      { name: 'Lezioni', icon: FaCalendarAlt, href: '/lessons' },
      { name: 'Esami', icon: FaGraduationCap, href: '/exams' },
    ],
    professor: [
      { name: 'Dashboard', icon: FaHome, href: '/home' },
      { name: 'Le Mie Lezioni', icon: FaCalendarAlt, href: '/lessons' },
      { name: 'Presenze', icon: FaClipboardCheck, href: '/attendances' },
      { name: 'Esami', icon: FaGraduationCap, href: '/exams' },
      { name: 'Studenti', icon: FaUserGraduate, href: '/students' },
      { name: 'Profilo', icon: FaUser, href: '/profile' },
    ],
    tutor: [
      { name: 'Dashboard', icon: FaHome, href: '/home' },
      { name: 'Studenti', icon: FaUserGraduate, href: '/students' },
      { name: 'Presenze', icon: FaClipboardCheck, href: '/attendances' },
      { name: 'Corsi', icon: FaChalkboardTeacher, href: '/courses' },
      { name: 'Lezioni', icon: FaCalendarAlt, href: '/lessons' },
    ],
    student: [
      { name: 'Dashboard', icon: FaHome, href: '/home' },
      { name: 'Il Mio Profilo', icon: FaUser, href: '/profile' },
      { name: 'Presenze', icon: FaClipboardCheck, href: '/attendances' },
      { name: 'Voti', icon: FaGraduationCap, href: '/exams' },
      { name: 'Lezioni', icon: FaCalendarAlt, href: '/lessons' },
    ],
  };

  return menus[role] || menus.student;
}

/**
 * Estrae il ruolo dall'utente salvato in localStorage
 * @returns UserRole o null se non autenticato
 */
export function getUserRole(): UserRole | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return user.role as UserRole;
  } catch {
    return null;
  }
}

/**
 * Helper per verificare se un ruolo ha permesso per una specifica risorsa
 * @param role - Ruolo utente
 * @param resource - Nome risorsa (es: 'students', 'users', etc)
 * @returns true se il ruolo può accedere alla risorsa
 */
export function hasAccess(role: UserRole, resource: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['users', 'students', 'professors', 'courses', 'subjects', 'lessons', 'attendances', 'exams'],
    professor: ['students', 'lessons', 'attendances', 'exams', 'profile'],
    tutor: ['students', 'courses', 'lessons', 'attendances'],
    student: ['profile', 'attendances', 'exams', 'lessons'],
  };

  return permissions[role]?.includes(resource) || false;
}
