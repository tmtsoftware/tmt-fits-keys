import React, {ChangeEvent, useState} from 'react';
import './App.css';

import {createStyles, fade, makeStyles, Theme} from '@material-ui/core/styles';
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

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import dictionary_json from './data/dictionary.json';
import attributes_json from './data/attributes.json';

import iris_json from './data/IRIS.json';
import modhis_json from './data/MODHIS.json';
import wfos_json from './data/WFOS.json';


// Map of attribute to description for the FITS key attributes in data/attributes.json
// used for tooltips in details table
const attributesMap = new Map(Object.entries(attributes_json))

declare module 'csstype' {
    // noinspection JSUnusedGlobalSymbols
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

// An attribute of a FITS key (displayed in details table)
interface Attribute {
    name: string,
    value: string
}

// A FITS key
interface Key {
    name: string,
    title: string,
    description: string,
    attributes: Array<Attribute>
}

// A dictionary of FITS keys (from data/category.json)
interface Dictionary {
    category: string,
    keys: Array<Key>
}

// A reference to a key in a Dictionary
interface KeyRef {
    dict: Dictionary,
    key: Key
}

const dictionaries = dictionary_json as Array<Dictionary>
const categoryNames = dictionaries.map(d => d.category)

// Arrays of references to keys for each instrument
const irisIds = iris_json as Array<string>
const modhisIds = modhis_json as Array<string>
const wfosIds = wfos_json as Array<string>

// Separator between category and keyword for nodeId
const sep = "|"

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

// Gets the Key for the given id (in the format Category<sep>Key, same as nodeId)
function getKeysForIds(ids: Array<string>): Array<KeyRef> {
    const keys = ids.map(id => {
        const [categoryName, keyName] = id.split(sep)
        if (keyName) {
            const dict = dictionaries.find(d => d.category === categoryName)
            if (dict) {
                const key = dict.keys.find(k => k.name === keyName)
                if (key) {
                    const keyRef: KeyRef = {dict: dict, key: key}
                    return keyRef
                }
            }
        }
        return undefined
    }).filter(keyRef => keyRef !== undefined)
    return keys as Array<KeyRef>
}

// XXX TODO: Simplify/automate this?
const instruments = new Map<string, Array<KeyRef>>()
const instNames = ["IRIS", "MODHIS", "WFOS"]
instruments.set("IRIS", getKeysForIds(irisIds))
instruments.set("MODHIS", getKeysForIds(modhisIds))
instruments.set("WFOS", getKeysForIds(wfosIds))

const topLevelNodes = ["Dictionary"].concat(categoryNames).concat(instNames)

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
        paragraph: {
            fontSize: 14
        },
        checkbox: {
            color: 'inherit',
        }
    }),
);

// Main App
export default function App() {

    // nodeId of the selected tree node
    const [selectedNode, setSelectedNode] = useState("");

    // List of nodeIds for expanded tree nodes
    const [expanded, setExpanded] = useState(["Dictionary"]);

    // Current contents of the Search filter box
    const [filter, setFilter] = useState("");

    // Current state of the checkbox for the Search filter
    const [checked, setChecked] = React.useState(false);

    const classes = useStyles();

    // Makes a nodeId for a tree node
    function makeKeyItemId(dict: Dictionary, key: Key) {
        return dict.category + sep + key.name;
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    // Filter the list of keys based on the contents of the search box
    // noinspection JSUnusedLocalSymbols
    function searchFilter(value: Key, index: number, array: Key[]) {
        const filt = filter === "" ? "" : filter.toUpperCase();
        return (filt === "") || value.name.includes(filt) ||
            (checked && (
                value.title.toUpperCase().includes(filt) ||
                value.description.toUpperCase().includes(filt)))
    }
    function keyRefSearchFilter(value: KeyRef, index: number, array: KeyRef[]) {
        return searchFilter(value.key, index, array.map(keyRef => keyRef.key))
    }

    // Makes the tree nodes for the FITS keys for the given category
    function keyItems(dict: Dictionary) {
        return dict.keys.filter(searchFilter).map(key => {
            const id = makeKeyItemId(dict, key);
            return <StyledTreeItem
                nodeId={id}
                key={id}
                labelText={key.name}
                labelIcon={ListAltIcon}/>
        })
    }

    // Makes the tree nodes for the FITS keys for the given instrument
    function instKeyItems(inst: string) {
        const keyRefs = instruments.get(inst) as Array<KeyRef>
        return keyRefs.filter(keyRefSearchFilter).map(keyRef => {
            // Add inst to id to make it unique
            const id = makeKeyItemId(keyRef.dict, keyRef.key) + sep + inst;
            return <StyledTreeItem
                nodeId={id}
                key={id}
                labelText={keyRef.key.name}
                labelIcon={ListAltIcon}/>;
        })
    }

    function nodeSelected(event: object, value: string) {
        setSelectedNode(value)
    }

    function nodeToggled(event: object, nodeIds: Array<string>) {
        setExpanded(nodeIds);
    }

    // Makes the tree displaying the categories of FITS keys
    function makeTreeView(classes: ClassNameMap, catItems: JSX.Element[], instItems: JSX.Element[]) {
        return <TreeView
            className={classes.root}
            defaultCollapseIcon={<ArrowDropDownIcon/>}
            defaultExpandIcon={<ArrowRightIcon/>}
            defaultEndIcon={<div style={{width: 24}}/>}
            onNodeSelect={nodeSelected}
            onNodeToggle={nodeToggled}
            expanded={expanded}
        >
            <StyledTreeItem
                key={"Dictionary"}
                nodeId={"Dictionary"}
                labelText={"Dictionary"}
                labelIcon={FolderIcon}>
                {catItems.concat(instItems)}
            </StyledTreeItem>
        </TreeView>;
    }

    // Makes the rows of the details table
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

    // Makes the detailed view displayed when you select a tree node with a FITS key
    function makeDetailView() {
        const [category, key] = selectedNode.split(sep)
        if (key) {
            const cat = dictionaries.find(c => c.category === category)
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
        return <div><p>Click on a keyword in the tree to show the details.</p></div>
    }

    // Called when the user types in the Search field
    function filterKeywords(event: ChangeEvent<HTMLInputElement>) {
        setFilter(event.target.value)
        // Expand tree if filter is set
        if (event.target.value !== "")
            setExpanded(topLevelNodes)
    }

    // Makes the top bar
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
                        <IconButton title="Expand All" color="inherit" onClick={() => setExpanded(topLevelNodes)}>
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={checked}
                                onChange={handleCheckboxChange}
                                classes={{
                                    root: classes.checkbox,
                                }}
                                inputProps={{'aria-label': 'primary checkbox'}}
                            />
                        }
                        label="Search includes title and description"
                    />
                    <div className={classes.grow}/>
                </Toolbar>
            </AppBar>
        );
    }

    // Makes the tree nodes for the categories of FITS keys
    const catItems = dictionaries.map(dict =>
        <StyledTreeItem
            key={dict.category}
            nodeId={dict.category}
            labelText={dict.category}
            labelIcon={FolderIcon}>
            {keyItems(dict)}
        </StyledTreeItem>
    );

    // Makes the tree nodes for the instruments
    const instItems = instNames.map( inst => {
        return <StyledTreeItem
            key={inst}
            nodeId={inst}
            labelText={inst}
            labelIcon={FolderIcon}>
            {instKeyItems(inst)}
        </StyledTreeItem>;
    });

    const treeView = makeTreeView(classes, catItems, instItems);
    const detailView = makeDetailView();

    // Do the layout in a grid
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
                        <Typography component="div" className={classes.paragraph}>
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


