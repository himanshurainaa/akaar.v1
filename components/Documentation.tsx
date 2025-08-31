import React from 'react';
import Icon from './Icon';

interface DocumentationProps {
  onClose: () => void;
}

const DocHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-slate-100 text-glow mt-12 mb-4 border-b border-violet-500/30 pb-3">{children}</h2>
);

const DocParagraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-slate-300 leading-relaxed mb-4 text-base">{children}</p>
);

const DiagramBox: React.FC<{ icon: any; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
            <Icon icon={icon} className="w-8 h-8 text-violet-400" />
        </div>
        <h4 className="font-bold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400">{description}</p>
    </div>
);

const Operator: React.FC<{ icon: any }> = ({ icon }) => (
    <div className="flex items-center justify-center text-slate-500">
        <Icon icon={icon} className="w-8 h-8" />
    </div>
);

const WorkflowStep: React.FC<{ icon: any; title: string; description: string; step: number; isLast?: boolean; }> = ({ icon, title, description, step, isLast = false }) => (
    <div className="flex items-start gap-5">
        <div className="flex flex-col items-center self-stretch">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 border-2 border-violet-400 flex items-center justify-center text-white font-bold text-xl z-10 shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                {step}
            </div>
            {!isLast && <div className="w-0.5 flex-grow bg-slate-700/50"></div>}
        </div>
        
        <div className={`pb-8 pt-1 ${isLast ? 'pb-0' : ''}`}>
            <h4 className="font-bold text-slate-100 text-xl flex items-center gap-3 mb-2">
                <Icon icon={icon} className="w-6 h-6 text-violet-300" />
                {title}
            </h4>
            <p className="text-slate-300 text-base leading-relaxed">{description}</p>
        </div>
    </div>
);

const MasterpieceFeature: React.FC<{icon: any; title: string; children: React.ReactNode}> = ({icon, title, children}) => (
    <div className="bg-black/20 p-5 rounded-2xl border border-white/10 h-full transform transition-transform hover:scale-105 hover:border-violet-500/50">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon icon={icon} className="w-6 h-6 text-violet-300" />
            </div>
            <h4 className="font-bold text-slate-100 text-lg">{title}</h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{children}</p>
    </div>
);


const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in-scale">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] rounded-3xl flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tighter text-glow text-gradient-ios">The ΛkaaR Codex</h1>
                <p className="text-sm text-slate-400">Our Vision for the Future of Fashion</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-all transform active:scale-95"
              aria-label="Close documentation"
            >
              <Icon icon="close" className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-8 overflow-y-auto">
            <DocParagraph>
                Welcome to ΛkaaR. We are redefining the fashion experience by solving the biggest challenge in online retail: the inability for customers to realistically try on clothes before they buy. Our application serves as a personal, virtual fitting room, using advanced AI to show you exactly how an outfit will look on you.
            </DocParagraph>

            <DocHeader>I. The Core Innovation</DocHeader>
            <DocParagraph>
                Our technology is built on a simple but powerful principle: your identity is unique and unchangeable. Unlike other virtual try-on solutions, ΛkaaR uses a proprietary "Identity-Lock" system. The AI intelligently separates the clothing from a product image and drapes it onto your photo with incredible realism, while ensuring your face, body, and features remain 100% yours.
            </DocParagraph>
            <div className="my-8 p-6 bg-black/30 border border-white/10 rounded-2xl">
                 <div className="grid grid-cols-3 sm:grid-cols-5 items-center gap-2 sm:gap-4">
                    <DiagramBox icon="person" title="Your Photo" description="The true you." />
                    <Operator icon="plus" />
                    <DiagramBox icon="outfit" title="The Outfit" description="Any clothing item." />
                    <Operator icon="plus" />
                    <DiagramBox icon="edit" title="Your Style" description="Your creative choices." />
                </div>
                 <div className="flex justify-center my-4">
                    <svg width="24" height="44" viewBox="0 0 24 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
                        <path d="M12 2V42M12 42L20 34M12 42L4 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="flex justify-center">
                    <DiagramBox icon="sparkle" title="ΛkaaR AI Engine" description="Creates your new, realistic look." />
                </div>
            </div>

            <DocHeader>II. The Seamless User Journey</DocHeader>
            <DocParagraph>
                We have designed a simple, intuitive process that puts incredible creative power at your fingertips.
            </DocParagraph>
            <div className="mt-8 flex flex-col">
               <WorkflowStep step={1} icon="person" title="Provide Your Photo" description="Start with a clear photo of yourself. This is the foundation for your virtual try-on." />
               <WorkflowStep step={2} icon="outfit" title="Upload Any Outfit" description="Select one or more images of clothing. Our AI is smart enough to combine multiple items into a single, cohesive look." />
               <WorkflowStep step={3} icon="switch-horizontal" title="Choose the Pose" description="Decide on the final stance. You can keep your original pose, adopt the pose from the clothing model, or describe a completely custom one." />
               <WorkflowStep step={4} icon="fit-regular" title="Select the Perfect Fit" description="Act as your own digital tailor. Choose from a range of fits, from Slim to Oversized, to see how the clothes drape on your body." />
               <WorkflowStep step={5} icon="edit" title="Make Custom Edits" description="This is where you can truly be creative. Change your hairstyle, add accessories, or alter the background with simple text commands." />
               <WorkflowStep step={6} icon="sparkle" title="Generate Your Look" description="With a single click, our AI engine processes your choices and creates a high-quality, realistic image of you in your new outfit." isLast={true} />
            </div>
            
             <DocHeader>III. Our Commitment to a Quality Experience</DocHeader>
             <DocParagraph>
                ΛkaaR is powered by a state-of-the-art visual synthesis engine. To ensure a fast, high-quality experience for all our users, we have a fair use policy in place. If you ever see a message about reaching a request limit, simply wait a few moments before trying again. This allows us to manage server demand and deliver the best possible results every time.
            </DocParagraph>

             <DocHeader>IV. Engagement & Refinement Tools</DocHeader>
             <DocParagraph>
                Creating your look is just the beginning. We provide a suite of tools to help you perfect and share your vision.
            </DocParagraph>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <MasterpieceFeature icon="sparkle" title="Enhance Quality">
                    Our one-click "Enhance" feature uses AI to improve the lighting, color, and sharpness of your final image, giving it a professional studio finish.
                </MasterpieceFeature>
                <MasterpieceFeature icon="undo" title="Explore Variations">
                    The Undo and Redo buttons allow you to easily go back and forth between your creative choices, making it simple to compare different styles.
                </MasterpieceFeature>
                <MasterpieceFeature icon="download" title="Download & Share">
                    Instantly save your final look in high resolution or share it with friends, family, or your social media followers.
                </MasterpieceFeature>
            </div>
            
            <div className="mt-12 pt-6 border-t border-violet-500/30 text-center">
                 <p className="text-slate-300 leading-relaxed text-base">
                    ΛkaaR is more than an application—it's the next step in the evolution of fashion. We are building a world where anyone can explore their style with confidence and creativity. Thank you for being a part of this journey.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Documentation;
