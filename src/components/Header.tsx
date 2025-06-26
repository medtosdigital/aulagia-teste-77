
import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirstAccess } from '@/hooks/useFirstAccess';
import { useFeedback } from '@/hooks/useFeedback';
import FeedbackModal from './FeedbackModal';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({
  title
}) => {
  const isMobile = useIsMobile();
  const { openModal } = useFirstAccess();
  const { openFeedbackModal, showFeedbackModal, closeFeedbackModal } = useFeedback();
  const [userProfile, setUserProfile] = useState({
    name: 'Professor(a)',
    photo: ''
  });

  // Carregar dados do perfil do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedPhoto = localStorage.getItem('userPhoto');
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile({
        name: profile.name || 'Professor(a)',
        photo: profile.photo || savedPhoto || ''
      });
    } else if (savedPhoto) {
      setUserProfile(prev => ({
        ...prev,
        photo: savedPhoto
      }));
    }

    // Adicionar listener para mudanças no localStorage
    const handleStorageChange = () => {
      const updatedProfile = localStorage.getItem('userProfile');
      const updatedPhoto = localStorage.getItem('userPhoto');
      
      if (updatedProfile) {
        const profile = JSON.parse(updatedProfile);
        setUserProfile({
          name: profile.name || 'Professor(a)',
          photo: profile.photo || updatedPhoto || ''
        });
      } else if (updatedPhoto) {
        setUserProfile(prev => ({
          ...prev,
          photo: updatedPhoto
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  const handleProfileClick = () => {
    // Disparar evento para navegar para o perfil
    window.dispatchEvent(new CustomEvent('navigateToProfile'));
  };

  const handleNotificationClick = () => {
    // Abrir modal de primeiro acesso
    openModal();
  };

  const handleHelpClick = () => {
    // Abrir modal de feedback
    openFeedbackModal();
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          {isMobile ? (
            // Mobile: Show AulagIA logo and tagline
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="logo-text text-primary-600 text-2xl font-medium">AulagIA</h1>
                <p className="text-gray-500 font-normal -mt-2 my-0 text-xs">Sua aula com toque mágico</p>
              </div>
            </div>
          ) : (
            // Desktop: Show page title
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Bell size={20} />
              </button>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            
            {isMobile ? (
              // Mobile: Show user avatar instead of help icon
              <button 
                onClick={handleProfileClick}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Avatar className="w-8 h-8 border-2 border-primary-200">
                  {userProfile.photo && (
                    <AvatarImage 
                      src={userProfile.photo} 
                      alt={userProfile.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-primary-100 text-primary-600 font-semibold text-sm">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              // Desktop: Show help icon that opens feedback modal
              <div className="relative">
                <button 
                  onClick={handleHelpClick}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Enviar feedback ou sugestão"
                >
                  <HelpCircle size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={closeFeedbackModal}
        onDontShowAgain={() => {}} // Não mostrar opção "não mostrar novamente" quando aberto manualmente
        showDontShowOption={false}
      />
    </>
  );
};

export default Header;
