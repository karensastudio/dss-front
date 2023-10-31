import parse from 'html-react-parser';
import { InformationCircleIcon } from '@heroicons/react/20/solid'

export default function ParagraphComponent(props) {
    const { block } = props;

    if (block?.tunes?.textVariant == "call-out") {
        return (
            <div key={block.id}>
                <div className="mb-3 rounded-[12px] bg-orange-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-orange-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <div className="text-sm text-orange-700">
                                <p>{parse(block.data.text)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={block.id}>
            <p className="mb-3">
                {parse(block.data.text)}
            </p>
        </div>
    )
}