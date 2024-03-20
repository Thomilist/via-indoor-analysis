import { writable } from "svelte/store";

export const map =
{
    href: "/map.jpg",
    x: 0,
    y: 0,
    width: 3470,
    height: 4844,
    resolution: 300
};

export let viewbox = writable(Object.assign({}, map));

export function resetViewbox()
{
    viewbox.set(Object.assign({}, map));
}
