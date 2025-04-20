import { Handle, Position } from 'reactflow';

const StandardNode = ({ data }) => {
  const { label, isExpanded, hasChildren, onToggleExpand, onNodeClick, sectionColor, priority } = data;
  
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
      className="px-4 py-3 rounded-lg shadow-md flex items-center justify-between border-2 min-w-[180px] max-w-[240px] transition-all hover:shadow-lg"
      style={{ 
        backgroundColor: 'white',
        borderColor: sectionColor,
        opacity: 1,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{ background: '#555' }}
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
        </div>
      </div>
      
      {hasChildren && (
        <div 
          className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300 flex-shrink-0 text-sm font-bold"
          onClick={handleExpandClick}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? '-' : '+'}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default StandardNode;
