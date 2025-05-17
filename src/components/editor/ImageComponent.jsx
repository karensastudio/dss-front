import parse from 'html-react-parser';
import clsx from 'clsx';

export default function ImageComponent(props) {
    const { element } = props;
    
    // Extract image settings from the data
    const withBorder = element.data.withBorder || false;
    const withBackground = element.data.withBackground || false;
    const stretched = element.data.stretched || false;
    const caption = element.data.caption || '';
    
    return (
        <div 
            key={element.id}
            className={clsx(
                "mb-3 relative",
                stretched ? "w-full" : "w-auto",
                withBackground ? "bg-gray-100 py-4 px-2 rounded-lg" : "",
                withBorder ? "border border-gray-300 rounded-lg overflow-hidden" : ""
            )}
        >
            <div className={clsx(
                "mx-auto",
                stretched ? "w-full" : "max-w-full",
                withBackground ? "max-w-[70%]" : "",
            )}>
                <img 
                    src={element.data.file.url} 
                    alt={caption}
                    className={clsx(
                        "rounded-lg",
                        stretched ? "w-full" : "max-w-full",
                    )} 
                />
                
                {caption && (
                    <div className="text-sm text-center text-gray-500 mt-2">
                        {caption}
                    </div>
                )}
            </div>
        </div>
    )
}