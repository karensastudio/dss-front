import parse from 'html-react-parser';
import { Link } from 'react-router-dom';
import { BsLink45Deg, BsChevronRight } from "react-icons/bs";

function convertToSlug(Text) {
    return Text.toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}

export default function LinkComponent(props) {
    const { block } = props;

    console.log(block);

    if (block.data.meta.type == "internal") {
        return <Link key={block.id} to={`/posts/${block.data.link.replace("https://dss-v2.netlify.app/posts/", "")}`} className="mb-3 flex shadow-sm border border-l-4 border-l-blue-500 rounded-[12px] bg-blue-50 items-center justify-start p-5">
            <div className="w-full text-neutral-900 flex items-center justify-between">
                <div>
                    <p className='font-bold'>
                        {block.data.meta.title}
                    </p>
                </div>
                <div>
                    <BsChevronRight className='text-neutral-900 text-lg ml-5' />
                </div>
            </div>
        </Link>;
    }
    if (block.data.meta.type == "external") {
        return <a key={block.id} href={block.data.link} target='_blank' className="mb-3 flex shadow-sm border rounded-[12px] bg-white items-center justify-start p-5">
            <div className="text-neutral-900 flex items-center justify-between">
                <div>
                    <p className='font-bold mb-3'>
                        {block.data.meta.title}
                    </p>
                    <p className='font-normal text-sm mb-3'>
                        {block.data.meta.description}
                    </p>
                </div>
                <div>
                    <BsLink45Deg className='text-neutral-900 text-lg ml-5' />
                </div>
            </div>
        </a>;
    }
}