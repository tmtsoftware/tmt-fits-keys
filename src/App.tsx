import React, {ChangeEvent, useState} from 'react';
import './App.css';

import {fade, makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem, {TreeItemProps} from '@material-ui/lab/TreeItem';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
// import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import {SvgIconProps} from '@material-ui/core/SvgIcon';
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {Grid, Paper} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';
import InputBase from "@material-ui/core/InputBase";

import categories_json from './data/categories.json';
import attributes_json from './data/attributes.json';

const attributesMap = new Map(Object.entries(attributes_json))

declare module 'csstype' {
    interface Properties {
        '--tree-view-color'?: string;
        '--tree-view-bg-color'?: string;
    }
}

type StyledTreeItemProps = TreeItemProps & {
    bgColor?: string;
    color?: string;
    labelIcon: React.ElementType<SvgIconProps>;
    labelInfo?: string;
    labelText: string;
};

interface Attribute {
    name: string,
    value: string
}

interface Key {
    name: string,
    title: string,
    description: string,
    attributes: Array<Attribute>
}

interface Category {
    category: string,
    keys: Array<Key>
}

const categories = categories_json as Array<Category>;
const categoryNames = categories.map(c => c.category)

// Separator between category and keyword for nodeId
const sep = "|";

const useTreeItemStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.text.secondary,
            '&:hover > $content': {
                backgroundColor: theme.palette.action.hover,
            },
            '&:focus > $content, &$selected > $content': {
                backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
                color: 'var(--tree-view-color)',
            },
            '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
                backgroundColor: 'transparent',
            },
        },
        content: {
            color: theme.palette.text.secondary,
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
            fontWeight: theme.typography.fontWeightMedium,
            '$expanded > &': {
                fontWeight: theme.typography.fontWeightRegular,
            },
        },
        group: {
            marginLeft: 0,
            '& $content': {
                paddingLeft: theme.spacing(2),
            },
        },
        expanded: {},
        selected: {},
        label: {
            fontWeight: 'inherit',
            color: 'inherit',
        },
        labelRoot: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.5, 0),
        },
        labelIcon: {
            marginRight: theme.spacing(1),
        },
        labelText: {
            fontWeight: 'inherit',
            flexGrow: 1,
        },
    }),
);

function StyledTreeItem(props: StyledTreeItemProps): JSX.Element {
    const classes = useTreeItemStyles();
    const {labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other} = props;

    const treeItem = <TreeItem
        label={
            <div className={classes.labelRoot}>
                <LabelIcon color="inherit" className={classes.labelIcon}/>
                <Typography variant="body2" className={classes.labelText}>
                    {labelText}
                </Typography>
                <Typography variant="caption" color="inherit">
                    {labelInfo}
                </Typography>
            </div>
        }
        style={{
            '--tree-view-color': color,
            '--tree-view-bg-color': bgColor,
        }}
        classes={{
            root: classes.root,
            content: classes.content,
            expanded: classes.expanded,
            selected: classes.selected,
            group: classes.group,
            label: classes.label,
        }}
        {...other}
    />
    return (
        treeItem
    );
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            maxWidth: 800,
            margin: `${theme.spacing(1)}px auto`,
            padding: theme.spacing(2),
        },
        control: {
            padding: theme.spacing(2),
        },
        grow: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            display: 'none',
            [theme.breakpoints.up('sm')]: {
                display: 'block',
            },
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(3),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
        sectionDesktop: {
            display: 'none',
            [theme.breakpoints.up('md')]: {
                display: 'flex',
            },
        },
        sectionMobile: {
            display: 'flex', [theme.breakpoints.up('md')]: {
                display: 'none',
            },
        },
        detailView: {
            fontSize: 14
        },
    }),
);


export default function App() {

    const [selectedNode, setSelectedNode] = useState("");

    const [expanded, setExpanded] = useState([""]);
    const [filter, setFilter] = useState("");

    const classes = useStyles();

    function makeKeyItemId(cat: Category, key: Key) {
        return cat.category + sep + key.name;
    }

    // Filter the list of keys based on the contents of the search box
    function searchFilter(value: Key, index: number, array: Key[]) {
        return filter == "" || value.name.startsWith(filter.toUpperCase())
    }

    function keyItems(cat: Category) {
        return cat.keys.filter(searchFilter).map(key =>
            <StyledTreeItem
                nodeId={makeKeyItemId(cat, key)}
                key={makeKeyItemId(cat, key)}
                labelText={key.name}
                labelIcon={ListAltIcon}/>
        )
    }

    function nodeSelected(event: object, value: string) {
        setSelectedNode(value)
    }

    function nodeToggled(event: object, nodeIds: Array<string>) {
        setExpanded(nodeIds);
    }

    function makeTreeView(classes: ClassNameMap, catItems: JSX.Element[]) {
        return <TreeView
            className={classes.root}
            defaultCollapseIcon={<ArrowDropDownIcon/>}
            defaultExpandIcon={<ArrowRightIcon/>}
            defaultEndIcon={<div style={{width: 24}}/>}
            onNodeSelect={nodeSelected}
            onNodeToggle={nodeToggled}
            expanded={expanded}
        >
            {catItems}
        </TreeView>;
    }

    function makeKeyRows(key: Key) {
        return key.attributes.map(attr =>
            <tr key={attr.name}>
                <td key={attr.name} title={attributesMap.get(attr.name)}>
                    {attr.name}
                </td>
                <td key={attr.value}>
                    {attr.value}
                </td>
            </tr>
        );
    }

    function makeDetailView() {
        const [category, key] = selectedNode.split(sep)
        if (key) {
            const cat = categories.find(c => c.category === category)
            if (cat) {
                const keyItem = cat.keys.find(k => k.name === key)
                if (keyItem) {
                    return <div>
                        <h2>{keyItem.name}</h2>
                        <h3>{keyItem.title}</h3>
                        <p>{keyItem.description}</p>
                        <table>
                            <thead key={"thead"}>
                            <tr>
                                <th key={"Attribute"}>Attribute</th>
                                <th key={"Value"}>Value</th>
                            </tr>
                            </thead>
                            <tbody>
                            {makeKeyRows(keyItem)}
                            </tbody>
                        </table>
                    </div>
                }
            }
        }
        return <div>Click on a keyword in the tree to show the details.</div>
    }

    function filterKeywords(event: ChangeEvent<HTMLInputElement>) {
        setFilter(event.target.value)
        // Expand tree if filter is set
        if (event.target.value != "")
            setExpanded(categoryNames)
    }

    function makeAppBar() {
        return (
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="open drawer"
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography className={classes.title} variant="h6" noWrap>
                        TMT Keyword Dictionary
                    </Typography>
                    <div className={classes.sectionDesktop}>
                        <IconButton title="Expand All" color="inherit" onClick={() => setExpanded(categoryNames)}>
                            <UnfoldMoreIcon/>
                        </IconButton>
                        <IconButton title="Collapse All" color="inherit" onClick={() => setExpanded([])}>
                            <UnfoldLessIcon/>
                        </IconButton>
                    </div>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon/>
                        </div>
                        <InputBase
                            placeholder=" Search Keywords…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                            inputProps={{'aria-label': 'search'}}
                            onChange={filterKeywords}
                        />
                    </div>
                    <div className={classes.grow}/>
                </Toolbar>
            </AppBar>
        );
    }


    const catItems = categories.map(cat =>
        <StyledTreeItem
            key={cat.category}
            nodeId={cat.category}
            labelText={cat.category}
            labelIcon={FolderIcon}>
            {keyItems(cat)}
        </StyledTreeItem>
    );

    const treeView = makeTreeView(classes, catItems);
    const detailView = makeDetailView();

    const grid = <Grid container className={classes.root} spacing={6}>
        <Grid item xs={12}>
            <Grid container justify="flex-start" spacing={6}>
                <Grid key="treeView" item>
                    <Toolbar>
                        <Typography variant="subtitle1" className="tree-title">
                            Browse Keywords
                        </Typography>
                    </Toolbar>
                    {treeView}
                </Grid>
                <Grid key="detailView" item>
                    <Toolbar>
                        <Typography variant="subtitle1" className="table-title">
                            Details
                        </Typography>
                    </Toolbar>
                    <Paper
                        // variant="outlined"
                        className={classes.paper}>
                        <Typography component="p" className={classes.detailView}>
                            {detailView}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    </Grid>

    const appBar = makeAppBar();

    const layout = <div>
        {appBar}
        {grid}
    </div>
    return (layout);
}


