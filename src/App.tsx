import React from 'react';
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

function StyledTreeItem(props: StyledTreeItemProps) {
    const classes = useTreeItemStyles();
    const {labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other} = props;

    return (
        <TreeItem
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
    );
}

const useStyles = makeStyles(
    createStyles({
        root: {
            height: 264,
            flexGrow: 1,
            maxWidth: 400,
        },
    }),
);

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

function makeKeyItemId(cat: Category, key: Key) {
    return cat.category + "." + key.name;
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
    console.log("XXX Node selected: " + value)
}

function makeTreeView(classes: ClassNameMap<string>, catItems: JSX.Element[]) {
    return <TreeView
        className={classes.root}
        // defaultExpanded={['3']}  // FIXME
        defaultCollapseIcon={<ArrowDropDownIcon/>}
        defaultExpandIcon={<ArrowRightIcon/>}
        defaultEndIcon={<div style={{width: 24}}/>}
        onNodeSelect={nodeSelected}
    >
        {catItems}
    </TreeView>;
}

export default function App() {
    const classes = useStyles();
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
    return treeView;
}

