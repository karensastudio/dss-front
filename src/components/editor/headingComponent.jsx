export default function HeadingComponent(props) {
    const { element } = props;

    if(element.data.level === 1) {
        return (
            <h1 className={`heading-${element.data.level} font-bold`}>
                {element.data.text}
            </h1>
        );
    }
    if(element.data.level === 2) {
        return (
            <h2 className={`heading-${element.data.level} font-bold`}>
                {element.data.text}
            </h2>
        );
    }
    if(element.data.level === 3) {
        return (
            <h3 className={`heading-${element.data.level} font-bold`}>
                {element.data.text}
            </h3>
        );
    }
    if(element.data.level === 4) {
        return (
            <h4 className={`heading-${element.data.level} font-bold`}>
                {element.data.text}
            </h4>
        );
    }
}