import { Link as RouterLink } from 'react-router-dom';

/**
 * Enhanced Link component with SEO-friendly attributes
 */
export default function Link({ 
  to, 
  children, 
  className = '', 
  rel = '',
  target = '',
  ...props 
}) {
  // Determine rel attribute for SEO
  const getRelAttribute = () => {
    if (rel) return rel;
    if (target === '_blank') return 'noopener noreferrer';
    return '';
  };

  return (
    <RouterLink
      to={to}
      className={className}
      rel={getRelAttribute()}
      target={target}
      {...props}
    >
      {children}
    </RouterLink>
  );
}