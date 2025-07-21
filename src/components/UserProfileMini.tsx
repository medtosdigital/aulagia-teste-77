import React from 'react';

const planoLabels = {
  gratuito: 'Gratuito',
  professor: 'Professor',
  grupo_escolar: 'Grupo Escolar',
  admin: 'Admin'
};

export function UserProfileMini({ profile, email }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1 border border-gray-200 shadow-sm">
      <img
        src={profile.avatar_url || '/placeholder.svg'}
        alt={profile.full_name || email}
        className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 border-blue-200 object-cover"
      />
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900 leading-tight text-sm sm:text-xs">{profile.full_name || email}</span>
        <span className="text-xs text-gray-500">{planoLabels[profile.plano_ativo] || 'Usuário'}</span>
      </div>
    </div>
  );
} 