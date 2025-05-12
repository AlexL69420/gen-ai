import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
} from "flowbite-react";

export function MyFooter() {
  return (
    <Footer
      container
      className="bg-blue-200 px-12 dark:bg-violet-950 dark:text-white"
    >
      <div className="w-full text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          <FooterBrand
            href="https://github.com/AlexL69420"
            src="https://avatars.mds.yandex.net/i?id=6e90335b851c9e6fe8473d562dabeff2f154cab3-12691405-images-thumbs&n=13"
            alt="logo"
            name="Alexander Letov"
          />
          <FooterLinkGroup className="flex w-1/2 flex-wrap gap-3">
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Licensing</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </FooterLinkGroup>
        </div>
        <FooterDivider />
        <FooterCopyright href="#" by="GenAI™" year={2025} />
      </div>
    </Footer>
  );
}
