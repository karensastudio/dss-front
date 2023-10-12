import parse from 'html-react-parser';

export default function ImageComponent(props) {
    const { element } = props;

    return (
        <div key={element.id}>
            <img src={element.data.file.url} alt={element.data.caption} className="max-w-full mx-auto rounded-[12px] mb-3" />
        </div>
    )
}