import { Section, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface HomeCtaProps {
  isAuthenticated?: boolean;
}

export default function HomeCta({ isAuthenticated }: HomeCtaProps) {
  return (
    <Section tight>
      <div className="ds-cluster ds-between">
        <p className="ds-lead">
          <Icon name="sparkle" size={18} /> Ready for your X-ray? Book a visit or check your results in a few taps.
        </p>
        {isAuthenticated ? (
          <Button to="/dashboard" variant="primary" size="lg">
            Go to dashboard
          </Button>
        ) : (
          <Button to="/register" variant="primary" size="lg">
            Create your account
          </Button>
        )}
      </div>
    </Section>
  );
}