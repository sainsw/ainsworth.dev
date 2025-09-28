import { PrideAvatar } from './pride-avatar';
import { AVATAR_VERSION } from '../../lib/version';

const year = new Date().getFullYear();

const getCopyrightString = async () => {
    var string = year.toString();
    if (year > 2024) {
        string = `2024 - ${string}`;
    }
    return `© Sam Ainsworth ${string}. All Rights Reserved.`;
};

export async function Footer() {
    const copyrightString = await getCopyrightString();
    return (
        <footer>
            <div className="relative h-64 ">
                <div className="absolute bottom-0 left-0 container mx-auto px-4">
                    <div className="flex flex-col pb-5">
                        {/* Avatar: left on mobile, centered on md+ to mimic homepage */}
                        <div className="w-full">
                            <a
                                className="block md:mx-auto mb-5 max-w-max"
                                aria-label="find me on linkedin"
                                href="https://linkedin.com/in/samainsworth"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <PrideAvatar>
                                    <picture>
                                        <source srcSet={`/images/home/avatar-${AVATAR_VERSION}.webp`} type="image/webp" />
                                        <img
                                            className="bg-left-bottom h-20 w-20 rounded-full"
                                            src={`/images/home/avatar-${AVATAR_VERSION}.jpg`}
                                            alt="my face"
                                            width={80}
                                            height={80}
                                            loading="lazy"
                                        />
                                    </picture>
                                </PrideAvatar>
                            </a>
                        </div>
                        {/* Copyright: always left aligned */}
                        <div className="prose prose-sm dark:prose-invert">
                            {copyrightString}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
