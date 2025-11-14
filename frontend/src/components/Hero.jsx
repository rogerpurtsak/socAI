export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      
      <div className="relative z-10 container mx-auto text-center max-w-4xl">
        <div className="inline-block animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            AI-Powered{" "}
            <span className="gradient-text animate-glow">
              Social Media
            </span>
            <br />
            Content Generator
          </h2>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
          Transform your ideas into engaging social media posts instantly. 
          Generate stunning images and captions with the power of AI.
        </p>
      </div>
    </section>
  );
};
