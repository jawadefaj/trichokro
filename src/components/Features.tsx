import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import fleetImage from "@/assets/fleet-rickshaws.jpg";

const Features = () => {
  const features = [
    {
      title: "Advanced Battery Technology",
      description: "Lithium-ion batteries with intelligent power management system",
      specs: ["120+ km range", "4-hour fast charging", "5-year warranty"]
    },
    {
      title: "Smart Dashboard",
      description: "Digital display showing speed, battery level, and trip information",
      specs: ["Digital speedometer", "Battery indicator", "Trip meter"]
    },
    {
      title: "Safety Features",
      description: "Built-in safety systems for driver and passenger protection",
      specs: ["LED headlights", "Brake assist", "Safety indicators"]
    },
    {
      title: "Comfort Design",
      description: "Ergonomic seating and weather protection for all conditions",
      specs: ["Cushioned seats", "Weather cover", "Storage space"]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Engineered for
              <span className="block text-primary">Excellence</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Every EcoRide electric rickshaw is built with premium components and 
              cutting-edge technology to deliver superior performance, comfort, and reliability.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 border-l-4 border-l-primary">
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.specs.map((spec, specIndex) => (
                      <span key={specIndex} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-8">
              <Button size="lg" className="bg-gradient-electric text-white hover:shadow-glow transition-all duration-300">
                View Specifications
              </Button>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-electric">
              <img 
                src={fleetImage} 
                alt="Electric rickshaw fleet showcasing modern design" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-electric opacity-20"></div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-glow p-6 border border-primary/20">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Happy Drivers</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-glow p-6 border border-primary/20">
              <div className="text-3xl font-bold text-primary">2+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;