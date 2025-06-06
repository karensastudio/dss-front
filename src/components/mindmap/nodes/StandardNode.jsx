import { Handle, Position } from 'reactflow';

const StandardNode = ({ data, sourcePosition, targetPosition }) => {
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
      className="px-4 py-3 rounded-lg shadow-md flex items-center justify-between border-2 min-w-[180px] max-w-[280px] transition-all hover:shadow-lg bg-white"
      style={{ 
        borderColor: sectionColor,
        opacity: 1,
      }}
    >
      <Handle 
        type="target" 
        position={targetPosition || Position.Top}
        style={{ background: '#555' }}
      />
      
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: sectionColor }}
        />
        <div 
          className="text-sm font-medium cursor-pointer hover:underline truncate"
          onClick={handleNodeClick}
          title={label}
        >
          {label}
        </div>
      </div>
      
      {hasChildren && (
        <div 
          className="ml-2 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-sm"
          onClick={handleExpandClick}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? '−' : '+'}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={sourcePosition || Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default StandardNode;
