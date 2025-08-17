import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Contact = () => {
  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Our Showroom",
      details: ["123 Green Avenue", "Dhanmondi, Dhaka 1205", "Bangladesh"],
      action: "Get Directions"
    },
    {
      icon: "📞",
      title: "Call Us Today",
      details: ["+880 1700 123456", "+880 2 9876543", "Available 8AM - 8PM"],
      action: "Call Now"
    },
    {
      icon: "💬",
      title: "WhatsApp Support",
      details: ["+880 1700 123456", "Quick responses", "Send photos & questions"],
      action: "Chat on WhatsApp"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2">
            Get Started Today
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Ready to Go
            <span className="block text-primary">Electric?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join the electric revolution today. Contact us for test drives, financing options, 
            and exclusive launch offers. Our team is ready to help you make the switch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-electric transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-4">{info.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-4">{info.title}</h3>
              <div className="space-y-2 mb-6">
                {info.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-muted-foreground">{detail}</p>
                ))}
              </div>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                {info.action}
              </Button>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="p-12 bg-gradient-hero text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-bold mb-6">
              Special Launch Offer - Save ৳50,000!
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Limited time offer for the first 100 customers. Includes free installation, 
              warranty, and 6 months free maintenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                Book Test Drive
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6">
                Download Brochure
              </Button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
        </Card>
      </div>
    </section>
  );
};

export default Contact;