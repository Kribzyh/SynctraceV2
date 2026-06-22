export const STORAGE_KEYS = {
  role: 'synctrace-user-role',
  initialized: 'synctrace-workspace-initialized',
  project: 'synctrace-project',
}

export function getUserRole() {
  return localStorage.getItem(STORAGE_KEYS.role)
}

export function isWorkspaceInitialized() {
  return localStorage.getItem(STORAGE_KEYS.initialized) === 'true'
}

export function getPostAuthRoute() {
  const role = getUserRole()
  if (role === 'adviser') {
    return '/adviser/dashboard'
  }
  if (role === 'student' && !isWorkspaceInitialized()) {
    return '/initialize-project'
  }
  return '/dashboard'
}

export function getProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.project)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveProject(project) {
  localStorage.setItem(STORAGE_KEYS.project, JSON.stringify(project))
  localStorage.setItem(STORAGE_KEYS.initialized, 'true')
}

export function setUserRole(role, { isNewUser = true } = {}) {
  localStorage.setItem(STORAGE_KEYS.role, role)
  if (role === 'student' && isNewUser) {
    localStorage.removeItem(STORAGE_KEYS.initialized)
    localStorage.removeItem(STORAGE_KEYS.project)
  } else if (role === 'adviser') {
    localStorage.setItem(STORAGE_KEYS.initialized, 'true')
  }
}
