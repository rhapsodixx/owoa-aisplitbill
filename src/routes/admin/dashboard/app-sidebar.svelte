<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { House, Users, Receipt, LogOut } from "lucide-svelte";
    import { page } from "$app/stores";

    const items = [
        {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: House,
        },
        {
            title: "Users",
            url: "/admin/dashboard/users",
            icon: Users,
        },
        {
            title: "Split Bills",
            url: "/admin/dashboard/bills",
            icon: Receipt,
        },
    ];

    let currentPath = $derived($page.url.pathname);
</script>

<Sidebar.Root collapsible="icon">
    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each items as item (item.title)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton
                                isActive={currentPath === item.url}
                            >
                                {#snippet child({ props })}
                                    <a href={item.url} {...props}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <form action="/admin/logout" method="POST">
                    <Sidebar.MenuButton type="submit">
                        {#snippet child({ props })}
                            <button {...props}>
                                <LogOut />
                                <span>Logout</span>
                            </button>
                        {/snippet}
                    </Sidebar.MenuButton>
                </form>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>
</Sidebar.Root>
