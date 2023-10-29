import parse from 'html-react-parser';

export default function ParagraphComponent(props) {
    const { block } = props;

    return (
        <div key={block.id}>
            <p className="mb-3">
                {parse(block.data.text)}
            </p>
        </div>
    )
}