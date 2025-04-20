import { Handle, Position } from 'reactflow';

const DecisionNode = ({ data }) => {
  const { label, isExpanded, hasChildren, onToggleExpand, onNodeClick, sectionColor } = data;
  
  // Event handlers to prevent propagation
  const handleExpandClick = (e) => {
    e.stopPropagation();
    onToggleExpand();
  };
  
  const handleNodeClick = (e) => {
    e.stopPropagation();
    onNodeClick();
  };
  
  return (
    <div 
      className="px-4 py-3 rounded-lg shadow-md flex items-center justify-between min-w-[180px] max-w-[240px] transition-all hover:shadow-lg"
      style={{ 
        backgroundColor: 'white',
        border: '3px solid #FFD700', // Gold border for decisions
        opacity: 1,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{ background: '#FFD700' }}
      />
      
      <div className="flex-1 flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: sectionColor }}
        />
        <div 
          className="text-sm font-medium cursor-pointer hover:underline flex-1 truncate"
          onClick={handleNodeClick}
          title={label}
        >
          {label}
          <span className="ml-1 text-xs font-normal text-yellow-600">(Decision)</span>
        </div>
      </div>
      
      {hasChildren && (
        <div 
          className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 cursor-pointer hover:bg-yellow-200 flex-shrink-0"
          onClick={handleExpandClick}
        >
          {isExpanded ? '-' : '+'}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{ background: '#FFD700' }}
      />
    </div>
  );
};

export default DecisionNode;
