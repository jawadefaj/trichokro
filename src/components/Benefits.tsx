import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Benefits = () => {
  const benefits = [
    {
      icon: "🌱",
      title: "Eco-Friendly",
      description: "Zero emissions, clean energy transportation for a greener Bangladesh",
      stats: "100% Electric"
    },
    {
      icon: "💰",
      title: "Cost Effective",
      description: "Save up to 70% on fuel costs with our efficient electric technology",
      stats: "70% Savings"
    },
    {
      icon: "🔋",
      title: "Long Range",
      description: "Advanced battery technology providing 120+ km range on single charge",
      stats: "120+ KM Range"
    },
    {
      icon: "⚡",
      title: "Fast Charging",
      description: "Quick 4-hour charging time gets you back on the road faster",
      stats: "4 Hour Charge"
    },
    {
      icon: "🛠️",
      title: "Low Maintenance",
      description: "Electric motors require minimal maintenance compared to fuel engines",
      stats: "90% Less Service"
    },
    {
      icon: "🏆",
      title: "Government Approved",
      description: "Fully licensed and approved by Bangladesh transport authorities",
      stats: "Certified"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            Why Choose Electric?
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Revolutionary Benefits for
            <span className="block text-primary">Smart Drivers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of drivers already saving money and protecting the environment 
            with our cutting-edge electric rickshaw technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-8 hover:shadow-electric transition-all duration-300 hover:-translate-y-2 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-foreground">{benefit.title}</h3>
                <Badge variant="outline" className="text-primary border-primary">
                  {benefit.stats}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;