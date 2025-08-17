import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const milestones = [
    { year: "2022", title: "Company Founded", description: "Started with a vision for green transportation" },
    { year: "2023", title: "First Fleet Launch", description: "Introduced 100 electric rickshaws in Dhaka" },
    { year: "2024", title: "Expansion", description: "Growing across Bangladesh with 500+ vehicles" }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            Our Story
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Driving Bangladesh's
            <span className="block text-primary">Electric Future</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            EcoRide is pioneering the electric vehicle revolution in Bangladesh. Founded by local entrepreneurs 
            with a passion for sustainable transport, we're committed to providing affordable, reliable, 
            and environmentally friendly transportation solutions.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 text-center hover:shadow-electric transition-shadow duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To revolutionize urban transportation in Bangladesh by making electric vehicles 
              accessible, affordable, and reliable for every driver and passenger.
            </p>
          </Card>
          
          <Card className="p-8 text-center hover:shadow-electric transition-shadow duration-300">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A cleaner, greener Bangladesh where electric vehicles are the standard, 
              contributing to better air quality and economic prosperity for all.
            </p>
          </Card>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Our Journey</h3>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-electric rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {milestone.year}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h4>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;