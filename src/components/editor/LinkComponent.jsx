import parse from 'html-react-parser';
import { Link } from 'react-router-dom';

function convertToSlug(Text) {
    return Text.toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}

export default function LinkComponent(props) {
    const { block } = props;

    if (block.data.meta.type == "internal") {
        return <Link key={block.id} to={`/posts/${convertToSlug(block.data.meta.title)}`} className="block cursor-pinter w-full rounded-[12px] px-3 py-5 bg-blue-500 text-white mb-3">
            <div className="text-white ">
                {block.data.meta.title}
            </div>
        </Link>;
    }
    if (block.data.meta.type == "external") {
        return <a key={block.id} href={block.data.link} target='_blank' className="block cursor-pinter w-full rounded-[12px] px-3 py-5 bg-gray-600 text-white mb-3">
            <div className="text-white ">
                {block.data.meta.title}
            </div>
        </a>;
    }
}