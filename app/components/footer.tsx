const year = new Date().getFullYear();

const getCopyrightString = async () => {
    var string = year.toString();
    if (year > 2024) {
        string = `2024 - ${string}`;
    }
    return `Copyright © ${string}
        

        Sam Ainsworth. All Rights Reserved.`;
};

export async function Footer() {
    const copyrightString = await getCopyrightString();
    return (
        <footer>
            <div className="relative h-64 ">
                <div className="absolute bottom-0 left-0 container mx-auto px-4">
                    <div className="-mx-4 flex flex-wrap justify-between">
                    <div className="prose prose-sm dark:prose-invert">
                        {copyrightString}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}