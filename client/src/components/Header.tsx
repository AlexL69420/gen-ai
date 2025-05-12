import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  DarkThemeToggle,
} from "flowbite-react";

export function Header() {
  return (
    <Navbar
      rounded
      className="flex h-14 w-full flex-row items-center gap-4 bg-blue-500 dark:bg-violet-900"
    >
      <NavbarBrand href="https://github.com/AlexL69420/gen-ai">
        <img
          src="https://avatars.mds.yandex.net/i?id=6e90335b851c9e6fe8473d562dabeff2f154cab3-12691405-images-thumbs&n=13"
          className="mr-3 h-6 rounded-full object-cover sm:h-9"
          alt="logo"
        />
        <span className="self-center font-mono text-2xl font-semibold whitespace-nowrap text-blue-200 hover:text-amber-100 dark:text-violet-500">
          GenAI
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <div className="flex w-1/4 flex-row items-center justify-end gap-2">
        <DarkThemeToggle className="flex size-12 items-center justify-around rounded-full border-2 border-white text-white hover:cursor-pointer hover:bg-blue-400 hover:text-amber-100 dark:border-slate-200 dark:text-slate-200 dark:hover:bg-violet-700" />
      </div>
    </Navbar>
  );
}
