import parse from 'html-react-parser';

export default function HeadingComponentV2(props) {
    const { element } = props;

    if (element.data.level === 1) {
        return (
            <h1 key={element.id} className={`heading-${element.data.level} font-bold`}>
                {parse(element.data.text)}
            </h1>
        );
    }
    if (element.data.level === 2) {
        return (
            <h2 key={element.id} className={`heading-${element.data.level} font-bold`}>
                {parse(element.data.text)}
            </h2>
        );
    }
    if (element.data.level === 3) {
        return (
            <h3 key={element.id} className={`heading-${element.data.level} font-bold`}>
                {parse(element.data.text)}
            </h3>
        );
    }
    if (element.data.level === 4) {
        return (
            <h4 key={element.id} className={`heading-${element.data.level} font-bold`}>
                {parse(element.data.text)}
            </h4>
        );
    }
}