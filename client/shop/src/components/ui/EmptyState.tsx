interface EmptyStateProps {
  label: string;
}

const EmptyState = ({ label }: EmptyStateProps) => {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-light text-gray-500 mb-4">No {label} available</h2>
      <p className="text-gray-400 text-lg font-light">
        Our collection is currently being refreshed. Please check back soon for new arrivals.
      </p>
    </div>
  );
};

export default EmptyState;
