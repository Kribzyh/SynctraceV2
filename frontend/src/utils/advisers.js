export const capstoneAdvisers = [
  { id: 'santos', name: 'Dr. Maria Santos', email: 'maria.santos@cit.edu', section: 'IT411' },
  { id: 'reyes', name: 'Prof. Juan Reyes', email: 'juan.reyes@cit.edu', section: 'IT411' },
  { id: 'cruz', name: 'Dr. Ana Cruz', email: 'ana.cruz@cit.edu', section: 'IT411' },
  { id: 'lim', name: 'Prof. Michael Lim', email: 'michael.lim@cit.edu', section: 'IT412' },
  { id: 'garcia', name: 'Dr. Elena Garcia', email: 'elena.garcia@cit.edu', section: 'IT412' },
]

export function getAdviserById(id) {
  return capstoneAdvisers.find((adviser) => adviser.id === id) ?? null
}
