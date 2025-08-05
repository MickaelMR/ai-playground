import { Metadata } from 'next';

import HomePage from '@/app/(delete-this-and-modify-page.tsx)/HomePage';
import ChatBot from '@/components/ui/ChatBot';
import { PromptType } from '@/constants/prompt-system';

export const metadata: Metadata = {
  title: 'Chatbots AI',
  description: 'Chatbots AI'
};

const Page = () => {
  return (
    <>
      <div className='text-center mt-8 mb-8'>
        <h1 className='text-4xl font-bold mb-2'>🦄 IA Playground - Ton assistant magique</h1>
        <p className='text-lg text-gray-600'>Découvrez notre collection d'assistants IA spécialisés pour vous accompagner dans vos projets professionnels et personnels</p>
      </div>
      <HomePage />
      <div className='mt-10 flex flex-col items-center gap-4 text-center'>
        {/*  <ChatBot langGraph promptType={PromptType.COACH} title='Coach Carter 🏀 ' />
        <ChatBot langGraph promptType={PromptType.DOCTOR} title='Docteur Maboul 🩺 ' />
        <ChatBot langGraph promptType={PromptType.WEATHER} title='Météo 🌤️ ' />
        <ChatBot langGraph promptType={PromptType.WORKPLACE_WELLBEING} title='Dr. Phil Good 🧠 ' />
        <ChatBot langGraph promptType={PromptType.STOP_TABAC} title='Cloppy le Fumeur Repenti 🚭 ' /> */}
        <ChatBot langGraph promptType={PromptType.MADAME_DOUBTFIRE} title='Madame Doubtfire 👶 ' />
        <ChatBot langGraph promptType={PromptType.LINKEDIN_RECRUITER} title='LinkedInBot Pro 💼 ' />
      </div>
    </>
  );
};

export default Page;
