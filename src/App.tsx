import React, {useState} from 'react';
import './App.css';

import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
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

import categories_json from './data/categories.json';
import {Grid, Paper} from "@material-ui/core";


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

interface Attributes {
    type: string,
    sql_dtype: string,
    calculation: string,
    default_value: string
}

interface Key {
    name: string,
    title: string,
    description: string,
    attributes: Attributes
}

interface Category {
    category: string,
    keys: Array<Key>
}

const categories = categories_json as Array<Category>;

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

    let treeItem = <TreeItem
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
    }),
);


export default function App() {

    const [selectedNode, setSelectedNode] = useState("");
    const classes = useStyles();

    function makeKeyItemId(cat: Category, key: Key) {
        return cat.category + sep + key.name;
    }

    function keyItems(cat: Category) {
        return cat.keys.map(key =>
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

    function makeTreeView(classes: ClassNameMap, catItems: JSX.Element[]) {
        return <TreeView
            className={classes.root}
            defaultCollapseIcon={<ArrowDropDownIcon/>}
            defaultExpandIcon={<ArrowRightIcon/>}
            defaultEndIcon={<div style={{width: 24}}/>}
            onNodeSelect={nodeSelected}
        >
            {catItems}
        </TreeView>;
    }

    function makeKeyRows(keys: Array<Key>) {
        return keys.map(key =>
            <tr>
                <td>
                    type
                </td>
                <td>
                    {key.attributes.type}
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
                        <h1>{keyItem.name}</h1>
                        <h2>{keyItem.title}</h2>
                        <p>{keyItem.description}</p>
                        <table>
                            <thead>
                            <tr>
                                <th>Attribute</th>
                                <th>Value</th>
                            </tr>
                            </thead>
                            <tbody>
                            {makeKeyRows(cat.keys)}
                            </tbody>
                        </table>
                    </div>
                }
            }
        }
        return <div>Click on keyword in tree to show details.</div>
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

    const grid = <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12}>
            <Grid container justify="flex-start" spacing={1}>
                <Grid key="treeView" item>
                    {treeView}
                </Grid>
                <Grid key="detailView" item>
                    <Paper
                        // variant="outlined"
                        className={classes.paper}>
                        {detailView}
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
    return (grid);
}


