import { useState } from "react";
import clsx from "clsx";

export default function DecisionTabView({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || children[0]?.props.name);
  
  // Filter and map only the valid tabs
  const tabs = children
    .filter(child => child?.props?.name)
    .map(child => ({
      name: child.props.name,
      label: child.props.label || child.props.name,
    }));
  
  // Get the active tab content
  const activeTabContent = children.find(child => child?.props?.name === activeTab);
  
  return (
    <div>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={clsx(
                tab.name === activeTab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
              )}
              aria-current={tab.name === activeTab ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-2">{activeTabContent}</div>
    </div>
  );
}

export function DecisionTab({ name, label, children }) {
  return <div className="decision-tab">{children}</div>;
} 